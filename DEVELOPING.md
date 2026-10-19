# Building Jago Material

Use Windows x64 and Microsoft Edge WebView2 Runtime. Install Node.js for the browser build and the .NET Framework C# compiler for the Windows host.

From this repository, run **Build.ps1** in PowerShell. The wrapper uses the included WebView2 SDK. Edit the files under **Source**, then rebuild; generated HTML is build output.

Keep licence notices with redistributed code and binaries.

## Print finish checks

With Playwright and Edge available, run `node Source/Tests/press-browser.cjs`. `MATERIAL_TEST_OUTPUT` chooses an evidence folder. It checks artistic and technical channels, comparison/Undo, project restoration, raised metals, and a bundled open font imported under a unique family and reopened in a fresh page. Test font files remain outside redistributable examples.

For Windows, copy Source/Native-probes/press-finish.js into a new test folder as probe.js, set JAGO_SUITE_ROOT to a private test location, then launch the built app with --suite-test and that folder. The existing release-probe.js covers navigation, generation and examples. Never use a personal app profile for test runs.
