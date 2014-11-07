window.addEventListener("load", function()
{
	var manifest = chrome.runtime.getManifest();

	document.querySelector("#version").innerHTML = manifest.version;
});