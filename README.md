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
- connects to a physical micro:bit from the standalone page using Web Serial
- writes qualifying predictions as `ClassName,confidence` lines at 115200 baud

### Run camera predictions on a physical micro:bit

1. Add this extension to MakeCode and flash a program that calls
   `teachableAI.startSerial()` to the micro:bit.
2. Open `https://megig.github.io/pxt-teachable/` directly in desktop Chrome or
   Edge. Web Serial requires a secure context and is not supported by every
   browser.
3. Select **Connect micro:bit** and choose the micro:bit USB serial port.
4. Start the camera, load a Teachable Machine Image model, and set the threshold.
5. Predictions meeting the threshold are sent to the micro:bit at 115200 baud.

The camera UI still publishes qualifying predictions to its parent window as
`pxt-teachable-prediction` messages for the local iframe harness. The supported
physical-device transport is the standalone Web Serial page. An embedded
MakeCode Editor Extension iframe may not receive permission to request a USB
serial port, so open the hosted page directly when using hardware.

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
npm run test:editor
npm run pxt:build
npm run pxt:test
```

`test.ts` exercises serial setup, decimal and percentage confidence parsing,
class matching, whitespace handling, invalid numbers, clamping to `0..100`,
messages without a comma, raw-message reporting, and empty-input behavior.
Assertions use a distinct message for every case; a passing test compiles and
runs without an assertion failure, while a failing case identifies itself by
its message.

`npm run test:editor` uses a mock Web Serial port to verify 115200-baud
connection, line output, duplicate throttling, class-name sanitizing, and clean
disconnect behavior without requiring hardware.

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
