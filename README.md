# pxt-teachable

MakeCode extension for connecting Teachable Machine image classification to BBC micro:bit.

for PXT/microbit

## What it does

`pxt-teachable` adds a **Teachable AI** block category to MakeCode and includes an optional Editor Extension UI for loading a Teachable Machine image model, opening the camera, and viewing realtime predictions inside MakeCode when the hosted editor URL is approved by the micro:bit target.

## Blocks API

### `start Teachable AI serial`

Starts listening for prediction lines over USB serial.

Expected formats:

```text
Person,0.94
Car,87
Empty,0.99
```

Confidence may be either `0..1` or `0..100`.

### `read AI prediction <line>`

Parses one prediction string and updates the current class and confidence values.

### `AI class`

Returns the latest predicted class name as text.

### `AI confidence (%)`

Returns the latest prediction confidence from 0 to 100.

### `AI class is <name> with confidence at least <value> %`

Returns `true` when the latest class matches the selected name and its confidence is at least the requested threshold.

### `last AI message`

Returns the most recent raw prediction line received by the extension.

## Example

```typescript
teachableAI.startSerial()
basic.forever(function () {
    if (teachableAI.isClass("Person", 80)) {
        basic.showIcon(IconNames.Happy)
    }
})
```

## Editor Extension

The Editor UI under `editor/`:

- loads `<model URL>/model.json` and `<model URL>/metadata.json`
- uses the Teachable Machine image library and `tmImage.Webcam`
- performs realtime image classification
- displays predicted classes and confidence
- supports a configurable confidence threshold
- implements MakeCode `pxtpkgext` messages including `extinit`, `extreadcode`, `extwritecode`, `extshown`, and `exthidden`
- stores model URL, threshold, and class labels through the Editor Extension project metadata bridge

### Current transport boundary

The camera UI and the micro:bit serial blocks are currently two verified pieces
with no production transport between them. The UI publishes qualifying
predictions to its parent window as `pxt-teachable-prediction` messages, but the
public MakeCode editor does not consume that custom message or write it to the
physical micro:bit. The `start Teachable AI serial` block receives lines written
to USB serial by a separate host bridge.

Before calling the system end-to-end complete, choose and implement a supported
runtime transport such as a standalone Chrome Web Serial bridge. The documented
MakeCode Editor Extension protocol can request serial data from the device with
`extdatastream`; it does not document an operation for writing prediction data
from the iframe to the device.

Hosted Editor URL:

```text
https://megig.github.io/pxt-teachable/
```

Local development URL:

```text
http://localhost:8787/
```

Run the local Editor test server with:

```bash
npm run serve:editor
```

Then open:

```text
http://localhost:8787/dev-host.html
```

## Testing

Install the pinned development toolchain and run the extension checks:

```bash
npm install
npm run pxt:setup
npm run pxt:build
npm run pxt:test
```

`test.ts` exercises serial setup, decimal and percentage confidence parsing,
class matching, whitespace handling, invalid numbers, clamping to `0..100`,
messages without a comma, raw-message reporting, and empty-input behavior.
Assertions use a distinct message for every case; a passing test compiles and
runs without an assertion failure, while a failing case identifies itself by
its message.

## MakeCode approval requirements

For the extension to appear in MakeCode's **Extensions** search, the repository must be added to `packages.approvedRepoLib` in `microsoft/pxt-microbit/targetconfig.json`.

For the hosted camera/editor iframe to open in production MakeCode, this URL must also be added to `packages.approvedEditorExtensionUrls`:

```text
https://megig.github.io/pxt-teachable/
```

Until that external approval is granted, users can add the blocks by pasting
the GitHub repository URL into the Extensions dialog, but MakeCode will not show
the hosted camera/editor iframe.

## License

MIT
