# pxt-teachable

MakeCode extension prototype for connecting Teachable Machine image classification to BBC micro:bit.

## Current scope

- Receive predictions over USB serial in the PXT blocks API.
- Parse `ClassName,confidence` messages.
- Expose MakeCode blocks for class, confidence, and threshold matching.
- Editor UI under `editor/` loads a Teachable Machine Image model.
- Editor UI requests webcam permission and performs realtime classification.
- Editor UI implements the MakeCode `pxtpkgext` iframe bridge (`extinit`, `extreadcode`, `extwritecode`, shown/hidden lifecycle handling).
- Model URL, class labels, and threshold can be persisted through the extension JSON metadata file when hosted as an approved MakeCode Editor Extension.
- `pxt.json` declares the hosted Editor Extension URL at `https://megig.github.io/pxt-teachable/` and keeps `http://localhost:8787/` for local development.

## Prediction protocol for micro:bit serial

Send one prediction per line:

```text
Person,0.94
Car,87
Empty,0.99
```

Confidence can be `0..1` or `0..100`.

## Local Editor Extension smoke test

Start the static editor server from this repository:

```bash
npm run serve:editor
```

Then open:

```text
http://localhost:8787/dev-host.html
```

The local host embeds `editor/index.html` in an iframe with camera permission and simulates the minimum MakeCode `pxtpkgext` lifecycle (`extinit`, `extshown`, `extreadcode`, `extwritecode`). This verifies camera access and bridge behavior without modifying another project.

The development server is a dependency-free Node script (`dev-server.js`), so it does not require Python or npm packages.

For a real local MakeCode target test, MakeCode documents using `localeditorextensions=1` and `extension.localUrl`. Production use requires replacing the development URL with a hosted HTTPS `extension.url` that is listed by the target under `packages.approvedEditorExtensionUrls`.

## Editor extension

The `editor/` directory is intentionally isolated from other projects. It uses the official Teachable Machine image library browser pattern:

- `<model base URL>/model.json`
- `<model base URL>/metadata.json`
- `tmImage.Webcam`
- realtime `model.predict(...)`

MakeCode Editor Extensions are loaded in an iframe and communicate with the editor using `pxtpkgext` messages.

## Next milestone

1. Run the local iframe smoke test and confirm camera permission works.
2. Add a final hosted HTTPS Editor Extension URL before production testing.
3. Test the real MakeCode Editor button against a local MakeCode target.
4. Decide the runtime transport from browser prediction to micro:bit: WebUSB serial, Bluetooth UART, or another supported bridge.
5. Add dynamic class-selector UX after model metadata is saved.
