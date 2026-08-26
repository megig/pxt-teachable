# MakeCode micro:bit approval request

This repository contains the technical preparation for a future submission to
the Microsoft MakeCode micro:bit target approval lists. Do not submit until the
external and product-readiness items below are resolved.

## Repository

- GitHub: `megig/pxt-teachable`
- Editor Extension: `https://megig.github.io/pxt-teachable/`
- Target: `microbit`
- Current extension version: `0.1.1`

## Requested targetconfig.json changes

### 1. Make the extension discoverable in Extensions search

Add this entry inside `packages.approvedRepoLib`:

```json
"megig/pxt-teachable": {
  "tags": ["Software"]
}
```

### 2. Allow the Editor Extension iframe

Add this URL inside `packages.approvedEditorExtensionUrls`:

```text
https://megig.github.io/pxt-teachable/
```

Both approvals are required for the intended user experience: users can find the extension from MakeCode's Extensions search and then open the hosted Teachable AI camera/editor UI inside MakeCode.

## Approval readiness

- MIT `LICENSE.txt`
- `icon.png` at 300 x 200 px and under 100 KB
- README includes `for PXT/microbit`
- README includes block/API documentation
- semantic version `0.1.1`
- tag `v0.1.1`
- HTTPS GitHub Pages Editor Extension URL
- `pxt build` passes against micro:bit target v9.1.1
- `pxt test` passes against micro:bit target v9.1.1

## Submission blockers

- The owner must confirm the educational-use and Foundation-mission statements
  in the official form.
- The official form asks whether a related accessory has been submitted to the
  micro:bit accessories list; applicability to this software-only extension
  needs confirmation from the Foundation.
- The owner must provide or confirm a product/blog page and links to educational
  materials and tutorials.
- The owner must confirm membership in the required micro:bit Slack channels.
- The Editor Extension URL is not currently in the production micro:bit
  `approvedEditorExtensionUrls` list. This is the reason the camera iframe is
  absent after adding the extension by URL.
- The camera classifier does not yet send predictions to a physical micro:bit.
  The blocks receive USB serial lines from a separate host bridge, while the UI
  currently emits a parent-window message only. Select and implement the final
  runtime transport before declaring the extension finished.

## Local verification

```bash
npm install
npm run pxt:setup
npm run pxt:build
npm run pxt:test
```

For the Editor Extension smoke test:

```bash
npm run serve:editor
```

Then open `http://localhost:8787/dev-host.html` for the local iframe harness, or use the GitHub Pages HTTPS URL to test camera secure-context behavior.
