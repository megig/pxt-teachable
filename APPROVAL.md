# MakeCode micro:bit approval request

This repository is prepared for submission to the Microsoft MakeCode micro:bit target approval lists.

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
