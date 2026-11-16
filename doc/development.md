# Local preview, testing, and review

## Local preview

No dependency installation or build is required for the static site. Start a server from the repository root so all relative links behave as they do on the hosted site:

```powershell
py -m http.server 8000
```

Open <http://localhost:8000/> and stop the server with Ctrl+C. If the Python launcher is unavailable, try:

```powershell
python -m http.server 8000
```

Opening a page directly from disk may work for simple lessons, but browser security rules differ for `file://`. Use localhost if a feature needs Web Crypto, browser storage, or a predictable origin.

## Tests

There is no root `package.json` or single command covering every learning unit. The repository's GitHub Actions workflow (`.github/workflows/validate-site.yml`) runs a dependency-free site checker for local HTML/CSS references and basic HTML metadata, its Python unit tests, and selected Node model tests on pushes and pull requests. Browser fixtures and project-specific Python tests are not all run by CI; find tests under the changed topic and read its README.

The site checker and its regression tests can be run locally with Python 3.10 or newer; they need no third-party packages:

```powershell
python tools/check_site.py
python -m unittest discover -s tools -p "test_*.py"
```

Install Node.js only if you need to run a topic's Node-based tests; they use the built-in test runner and do not require an npm install. Browser fixtures may require a browser such as Chrome, as described by the topic.

Examples documented by their owners:

```sh
node --test ph6/experiment-aufbauen/tests/model.test.js
node --test ph6/experiment-aufbauen/tests/pendulum.test.js
node --test phef/wegdifferenz/tests/model.test.js
node --test phef/wegdifferenz/tests/history.test.js
```

The Informatics EF browser runner can be started from the repository root with:

```powershell
py ifef/klausurtraining/tests/run_browser.py
```

Check the topic documentation for required browsers, executables, environment variables, or browser profiles. A file named `*.test.js` is not necessarily a Node test: some are scripts loaded by a browser fixture such as `tests/browser.html`. Open or serve that fixture as instructed rather than assuming every such file can be passed to `node --test`.

Browser tests may write to local browser storage. Use a disposable/separate profile whenever the test instructions call for one, and follow the topic README's precautions. Do not run stateful tests against a browser profile containing learner work you need to keep.

## Review checklist

### Functionality

- [ ] Open the lesson from its intended landing page and follow every new link.
- [ ] Check scripts, stylesheets, fonts, and images load from the expected relative paths.
- [ ] Try a valid answer, an incorrect answer, empty input, malformed input, and important boundary cases.
- [ ] Confirm reset, progress, export, and persistence behavior match what the interface promises.
- [ ] Run the focused tests documented for this topic.

### Learning and accessibility

- [ ] The learner, goal, prerequisites, and steps are clear.
- [ ] Units, sign conventions, formulas, and model limitations are explicit where needed.
- [ ] Feedback is understandable and helps the learner decide what to do next.
- [ ] Every action works with a keyboard; dragging has an alternative.
- [ ] Labels, focus order, status messages, image alternatives, and contrast are usable.
- [ ] The layout works on a narrow phone-sized viewport as well as a desktop.
- [ ] The lesson does not invent or silently alter learners' measurements.

### Scope and maintenance

- [ ] Changes follow nearby project conventions and avoid unrelated shared-style edits.
- [ ] Local persistence and third-party assets are explained where relevant.
- [ ] Topic-specific instructions are updated if commands, behavior, or assumptions changed.
- [ ] No learner data, browser profile, credential, or generated test artifact is included.

## GitHub Pages deployment

GitHub Pages is the deployment target. The site is static and its main entry point is the root `index.html`, so no build command or generated output directory is needed.

### One-time repository setup

1. Push the site files to GitHub.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch that contains the site (commonly `main`) and choose `/(root)` as the folder, then save.
5. Wait for the Pages deployment to finish. The Pages settings show the published URL and deployment status.

This repository includes a validation workflow, `.github/workflows/validate-site.yml`, but it does not deploy Pages. If the repository is configured to publish through a separate Actions workflow instead of a source branch, follow that workflow's process rather than adding a competing deployment method. The validation workflow passing does not prove that Pages is enabled or deployed.

### Publishing a change

Commit and push the verified changes to the branch selected in Pages settings. GitHub Pages publishes the updated static files automatically. Check the Pages deployment status in GitHub and open the published URL to verify the result. A fork or repository with a different owner can have a different site URL; use the URL shown in that repository's Pages settings.

Before publishing, confirm that:

- the root `index.html` and every linked page or asset are committed;
- links use the correct relative paths and filename capitalization;
- the change works from a local server started at the repository root;
- any topic-specific tests have passed, and the documentation reflects changes to behavior, assumptions, or test instructions.
