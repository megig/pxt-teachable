const els = {
  modelUrl: document.getElementById('modelUrl'),
  loadModel: document.getElementById('loadModel'),
  startCamera: document.getElementById('startCamera'),
  stopCamera: document.getElementById('stopCamera'),
  saveConfig: document.getElementById('saveConfig'),
  webcamContainer: document.getElementById('webcamContainer'),
  cameraPlaceholder: document.getElementById('cameraPlaceholder'),
  className: document.getElementById('className'),
  confidence: document.getElementById('confidence'),
  threshold: document.getElementById('threshold'),
  thresholdValue: document.getElementById('thresholdValue'),
  classList: document.getElementById('classList'),
  modelStatus: document.getElementById('modelStatus'),
  bridgeStatus: document.getElementById('bridgeStatus')
};

const state = {
  extId: window.location.hash ? window.location.hash.substring(1) : '',
  model: null,
  webcam: null,
  modelUrl: '',
  classes: [],
  running: false,
  rafId: 0,
  pending: new Map()
};

function setMessage(text, isError = false) {
  els.modelStatus.textContent = text;
  els.modelStatus.classList.toggle('error', isError);
}

function normalizeModelUrl(value) {
  let url = (value || '').trim();
  if (!url) return '';
  if (!url.endsWith('/')) url += '/';
  return url;
}

function renderClasses(predictions = []) {
  if (!state.classes.length) {
    els.classList.textContent = 'No model loaded.';
    return;
  }
  const scoreByClass = new Map(predictions.map(p => [p.className, p.probability]));
  els.classList.innerHTML = '';
  for (const className of state.classes) {
    const row = document.createElement('div');
    row.className = 'class-row';
    const name = document.createElement('span');
    name.textContent = className;
    const score = document.createElement('strong');
    const probability = scoreByClass.get(className) || 0;
    score.textContent = `${Math.round(probability * 100)}%`;
    row.append(name, score);
    els.classList.appendChild(row);
  }
}

async function loadModel() {
  const baseUrl = normalizeModelUrl(els.modelUrl.value);
  if (!baseUrl) {
    setMessage('Please enter a model URL.', true);
    return;
  }
  if (!window.tmImage) {
    setMessage('Teachable Machine library did not load.', true);
    return;
  }

  try {
    setMessage('Loading model...');
    els.loadModel.disabled = true;
    const model = await tmImage.load(`${baseUrl}model.json`, `${baseUrl}metadata.json`);
    state.model = model;
    state.modelUrl = baseUrl;
    state.classes = typeof model.getClassLabels === 'function'
      ? model.getClassLabels()
      : Array.from({ length: model.getTotalClasses() }, (_, i) => `Class ${i + 1}`);
    els.startCamera.disabled = state.running;
    els.saveConfig.disabled = false;
    renderClasses();
    setMessage(`Model loaded: ${state.classes.length} classes.`);
  } catch (error) {
    state.model = null;
    state.classes = [];
    els.startCamera.disabled = state.running;
    els.saveConfig.disabled = true;
    renderClasses();
    setMessage(`Model load failed: ${error.message}`, true);
  } finally {
    els.loadModel.disabled = false;
  }
}

async function startCamera() {
  if (state.running) return;
  try {
    const size = 320;
    const flip = true;
    const webcam = new tmImage.Webcam(size, size, flip);
    await webcam.setup();
    await webcam.play();
    state.webcam = webcam;
    state.running = true;

    els.webcamContainer.innerHTML = '';
    const node = webcam.canvas || webcam.webcam;
    if (node) els.webcamContainer.appendChild(node);
    els.cameraPlaceholder.style.display = 'none';
    els.startCamera.disabled = true;
    els.stopCamera.disabled = false;
    setMessage(state.model
      ? 'Camera running. Classification is active.'
      : 'Camera running. Load a model to start classification.');
    state.rafId = requestAnimationFrame(loop);
  } catch (error) {
    setMessage(`Camera unavailable: ${error.message}`, true);
  }
}

async function loop() {
  if (!state.running || !state.webcam) return;
  state.webcam.update();
  if (!state.model) {
    state.rafId = requestAnimationFrame(loop);
    return;
  }
  try {
    const source = state.webcam.canvas || state.webcam.webcam;
    const predictions = await state.model.predict(source);
    updatePrediction(predictions);
  } catch (error) {
    setMessage(`Prediction failed: ${error.message}`, true);
    stopCamera();
    return;
  }
  state.rafId = requestAnimationFrame(loop);
}

function updatePrediction(predictions) {
  if (!predictions || !predictions.length) return;
  const best = predictions.reduce((a, b) => a.probability >= b.probability ? a : b);
  const percent = Math.round(best.probability * 100);
  els.className.textContent = best.className;
  els.confidence.textContent = `${percent}%`;
  renderClasses(predictions);

  const threshold = Number(els.threshold.value);
  if (percent >= threshold) {
    sendPredictionToParent(best.className, percent);
  }
}

function stopCamera() {
  state.running = false;
  if (state.rafId) cancelAnimationFrame(state.rafId);
  state.rafId = 0;
  if (state.webcam) {
    try { state.webcam.stop(); } catch (_) {}
  }
  state.webcam = null;
  els.webcamContainer.innerHTML = '';
  els.cameraPlaceholder.style.display = 'grid';
  els.startCamera.disabled = false;
  els.stopCamera.disabled = true;
}

function pxtMessage(action, body, response = false) {
  if (!state.extId || window.parent === window) return null;
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const msg = {
    id,
    type: 'pxtpkgext',
    action,
    extId: state.extId,
    response,
    body
  };
  window.parent.postMessage(msg, '*');
  return id;
}

function initMakeCodeBridge() {
  if (!state.extId || window.parent === window) {
    els.bridgeStatus.textContent = 'Standalone';
    return;
  }
  els.bridgeStatus.textContent = 'Connecting MakeCode...';
  const id = pxtMessage('extinit', undefined, true);
  if (id) state.pending.set(id, 'extinit');
}

function saveConfig() {
  const config = {
    modelUrl: state.modelUrl,
    threshold: Number(els.threshold.value),
    classes: state.classes
  };
  const code = `// Auto-generated by pxt-teachable Editor Extension\n// Model: ${state.modelUrl}\n`;
  pxtMessage('extwritecode', {
    code,
    json: JSON.stringify(config)
  }, false);
  setMessage('Configuration sent to MakeCode.');
}

function requestSavedConfig() {
  const id = pxtMessage('extreadcode', undefined, true);
  if (id) state.pending.set(id, 'extreadcode');
}

function restoreConfig(body) {
  if (!body || !body.json) return;
  try {
    const config = JSON.parse(body.json);
    if (config.modelUrl) els.modelUrl.value = config.modelUrl;
    if (typeof config.threshold === 'number') {
      els.threshold.value = String(config.threshold);
      els.thresholdValue.textContent = `${config.threshold}%`;
    }
  } catch (_) {}
}

function sendPredictionToParent(className, confidence) {
  window.parent.postMessage({
    type: 'pxt-teachable-prediction',
    className,
    confidence
  }, '*');
}

window.addEventListener('message', event => {
  const msg = event.data;
  if (!msg || msg.type !== 'pxtpkgext') return;

  if (msg.action === 'extshown') {
    els.bridgeStatus.textContent = 'MakeCode connected';
  } else if (msg.action === 'exthidden') {
    stopCamera();
  }

  if (msg.id && state.pending.has(msg.id)) {
    const pendingAction = state.pending.get(msg.id);
    state.pending.delete(msg.id);
    if (pendingAction === 'extinit') {
      els.bridgeStatus.textContent = 'MakeCode connected';
      requestSavedConfig();
    } else if (pendingAction === 'extreadcode') {
      restoreConfig(msg.body);
    }
  }
});

els.threshold.addEventListener('input', () => {
  els.thresholdValue.textContent = `${els.threshold.value}%`;
});
els.loadModel.addEventListener('click', loadModel);
els.startCamera.addEventListener('click', startCamera);
els.stopCamera.addEventListener('click', stopCamera);
els.saveConfig.addEventListener('click', saveConfig);
window.addEventListener('beforeunload', stopCamera);

initMakeCodeBridge();
