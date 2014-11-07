/**
 * i18n HTML wrapper
 */
window.addEventListener("load", function()
{
	matches = document.querySelectorAll('[data-i18n]');

	for (i = 0; i < matches.length; i++)
	{
		matches[i].innerHTML = chrome.i18n.getMessage(matches[i].getAttribute("data-i18n"))
	}
});