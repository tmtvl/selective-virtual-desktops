/* ============================================================================
 * Running configuration
 * ========================================================================= */
var enabledDisplays = [];

/* ============================================================================
 * Helper function. Is screen with (index) enabled for virtual desktops?
 * ========================================================================= */
function isDisplayEnabled(output) {
	const outputName = output.name;

	print("selective-virtual-desktops: Looking up output: " + outputName);

	const displayIndex = enabledDisplays.indexOf(output.name);

	print("selective-virtual-desktops: Index is: " + displayIndex);

	return displayIndex != -1;
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
			print("selective-virtual-desktops: Window "
				  + currentWindow.internalId + " has been unpinned.");
		}
	} else {
		/* Was window previously unpinned, and moved to a screen without
		 * virtual desktops? */
		if (!isDisplayEnabled(currentWindow.output)) {
			/* Then pin it. */
			currentWindow.desktops = [];
			print("selective-virtual-desktops: Window"
				  + currentWindow.internalId + "has been pinned.");
		}
	}
}

function bind(window) {
	handleWindow(window);

	window.outputChanged.connect(window, handleWindow);
	window.desktopsChanged.connect(window, handleWindow);

	print("selective-virtual-desktops: Window " + window.internalId
		  + " has been bound.");
}

/* ============================================================================
 * Kick the bucket!
 * ========================================================================= */
function main() {
	/* Handle configuration */
	print("selective-virtual-desktops: Parsing configuration: "
		  + readConfig('enabledDisplays', '').toString() + ".");

	enabledDisplays = readConfig('enabledDisplays', '').toString().split(',');
	options.configChanged.connect(function () {
		enabledDisplays =
			readConfig('enabledDisplays', '').toString().split(',');
	});

	print("selective-virtual-desktops: Loaded configuration.");

	for (const enabledDisplay in enabledDisplays) {
		print("selective-virtual-desktops: enabled display " + enabledDisplay
			  + ".");
	}

	/* Handle existing clients */
	workspace.windowList().forEach(bind);

	/* Handle new windows */
	workspace.windowAdded.connect(bind);
}

main();
