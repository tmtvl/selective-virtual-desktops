/* ============================================================================
 * Running configuration
 * ========================================================================= */
var enabledDisplays = [];

/* ============================================================================
 * Helper function. Is screen with (index) enabled for virtual desktops?
 * ========================================================================= */
function isDisplayEnabled(output) {
	return enabledDisplays.indexOf(output.name) != -1;
}

/* ============================================================================
 * Handle pinning and unpinning of windows
 * ========================================================================= */
function handleWindow(window) {
	const currentWindow = window || this;

	/* Skip these windows. */
	if (currentWindow.desktopWindow || currentWindow.dock
		|| (!currentWindow.normalWindow && currentWindow.skipTaskbar)) {
		return;
	}

	/* Was window previously pinned... */
	if (currentWindow.desktops.length == 0) {
		/* ...and was moved to a screen with virtual desktops? */
		if (isDisplayEnabled(currentWindow.output)) {
			/* Then unpin it. */
			currentWindow.desktops = workspace.currentDesktop;
		}
	} else {
		/* Was window previously unpinned, and moved to a screen without
		 * virtual desktops? */
		if (!isDisplayEnabled(currentWindow.output)) {
			/* Then pin it. */
			currentWindow.desktops = [];
		}
	}
}

function bind(window) {
	handleWindow(window);

	window.outputChanged.connect(window, handleWindow);
	window.desktopsChanged.connect(window, handleWindow);
}

/* ============================================================================
 * Kick the bucket!
 * ========================================================================= */
function main() {
	/* Handle configuration */
	enabledDisplays = readConfig('enabledDisplays', '').toString().split(',');
	options.configChanged.connect(function () {
		enabledDisplays =
			readConfig('enabledDisplays', '').toString().split(',');
	});

	/* Handle existing clients */
	workspace.windowList().forEach(bind);

	/* Handle new windows */
	workspace.windowAdded.connect(bind);
}

main();
