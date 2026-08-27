const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const editorDir = __dirname;
const html = fs.readFileSync(path.join(editorDir, 'index.html'), 'utf8')
  .replace(/<script src="https:[\s\S]*?<\/script>/g, '')
  .replace('<script src="app.js"></script>', '');
const appSource = fs.readFileSync(path.join(editorDir, 'app.js'), 'utf8');

const dom = new JSDOM(html, {
  pretendToBeVisual: true,
  runScripts: 'dangerously',
  url: 'https://example.test/'
});
const { window } = dom;
window.TextEncoder = TextEncoder;

const writes = [];
let openOptions = null;
let closeCount = 0;
const port = {
  writable: {
    getWriter() {
      return {
        async write(bytes) { writes.push(new TextDecoder().decode(bytes)); },
        releaseLock() {}
      };
    }
  },
  async open(options) { openOptions = options; },
  async close() { closeCount += 1; }
};
const serial = new window.EventTarget();
serial.requestPort = async () => port;
Object.defineProperty(window.navigator, 'serial', { value: serial });

window.eval(appSource);

const connectButton = window.document.getElementById('connectSerial');
const disconnectButton = window.document.getElementById('disconnectSerial');
const serialStatus = window.document.getElementById('serialStatus');
const serialOutput = window.document.getElementById('serialOutput');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  assert.equal(connectButton.disabled, false, 'connect button should be enabled');
  connectButton.click();
  await wait(0);
  assert.equal(openOptions.baudRate, 115200, 'serial port should open at 115200 baud');
  assert.match(serialStatus.textContent, /connected at 115200 baud/);
  assert.equal(disconnectButton.disabled, false, 'disconnect button should be enabled');

  window.eval('sendPredictionToParent("Person", 92)');
  await wait(0);
  assert.deepEqual(writes, ['Person,92\n'], 'prediction should be written as one serial line');
  assert.equal(serialOutput.textContent, 'Last sent: Person,92');

  window.eval('sendPredictionToParent("Person", 92)');
  await wait(0);
  assert.equal(writes.length, 1, 'duplicate prediction should be throttled');

  await wait(260);
  window.eval('sendPredictionToParent("Car,\\nNorth", 87)');
  await wait(0);
  assert.equal(writes[1], 'Car  North,87\n', 'class delimiters should be sanitized');

  disconnectButton.click();
  await wait(0);
  assert.equal(closeCount, 1, 'serial port should close once');
  assert.equal(connectButton.disabled, false, 'connect button should be re-enabled');
  assert.equal(disconnectButton.disabled, true, 'disconnect button should be disabled');

  console.log('Editor Web Serial smoke test passed.');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => dom.window.close());
