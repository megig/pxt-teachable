# Deploy pxt-teachable Editor to GitHub Pages

This repository deploys only the `editor/` directory to the `gh-pages` branch.

## Expected URL

For a repository named `pxt-teachable`, the Pages URL will normally be:

```text
https://<github-user-or-org>.github.io/pxt-teachable/
```

## One-time GitHub setup

1. Create a GitHub repository named `pxt-teachable`.
2. Push this project to the repository's `main` branch.
3. Publish the editor directory as the Pages branch:

   ```bash
   git subtree split --prefix editor -b gh-pages
   git push -u origin gh-pages
   ```

4. In GitHub open **Settings → Pages**.
5. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
6. Select branch **gh-pages**, folder **/(root)**, then save.
7. Open the generated HTTPS Pages URL and confirm the browser asks for camera permission.

## MakeCode configuration

After the final Pages URL is known, set `pxt.json`:

```json
"extension": {
  "url": "https://<github-user-or-org>.github.io/pxt-teachable/",
  "localUrl": "http://localhost:8787/"
}
```

The production `url` must be HTTPS. The `localUrl` is only for local development.

## Important MakeCode limitation

For the Editor button to load this iframe in the public MakeCode target, the hosted URL must also be accepted by the MakeCode target's Editor Extension allowlist/approval mechanism. GitHub Pages solves HTTPS hosting and camera secure-context requirements, but it does not bypass MakeCode's Editor Extension approval policy.
