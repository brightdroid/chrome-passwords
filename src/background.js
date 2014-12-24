/**
 * content messages
 */
function onMessageContent(msg, port)
{
	/**
	 * display PageAction Icon
	 */
	if (msg.action == "showPageAction" && port.sender.tab.id)
	{
		chrome.pageAction.show(port.sender.tab.id);
	}
}



/**
 * popup messages
 */
function onMessagePopup(msg, port)
{
	/**
	 * generate password
	 */
	if (msg.action == "generate")
	{
		// correct params?
		if (!msg.master || !msg.domain || !msg.counter || !msg.template)
		{
			throw new Error("Error calling generate function, wrong params!");
		}

		// get username from prefs, then generate password
		chrome.storage.sync.get("opt:username", function(prefs)
		{
			var mpw = new MPW(prefs["opt:username"], msg.master);

			var hasher = mpw.generatePassword(msg.domain, msg.counter, msg.template);

			hasher.then(
				function (pass)
				{
					port.postMessage({
						from: "background",
						action: "passwordResult",
						password: pass
					});

				},
				function (err)
				{
					throw new Error("Password could not be generated, please open a issue at https://github.com/brightdroid/chrome-passwords");
				}
			);
		});
	}
}



/**
 * extension messaging
 */
chrome.runtime.onConnect.addListener(function(port)
{
	// content channel
	if (port.name == "content")
	{
		port.onMessage.addListener(onMessageContent);

	}
	// popup channel
	else if (port.name == "popup")
	{
		port.onMessage.addListener(onMessagePopup);
	}
});