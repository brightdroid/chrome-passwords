chrome.runtime.onMessage.addListener(function(msg, sender)
{
    /**
	 * display PageAction Icon
	 */
    if (msg.from == "content" && msg.action == "showPageAction")
	{
        chrome.pageAction.show(sender.tab.id);
		
    }
    /**
	 * generate password
	 */
    else if (msg.action == "generate")
	{
		chrome.storage.sync.get("opt:username", function(prefs)
		{
			var mpw = new MPW(prefs["opt:username"], msg.master);
			
			var hasher = mpw.generatePassword(msg.domain, msg.counter, msg.template);
			
			hasher.then(
				function (pass)
				{
					chrome.tabs.query(
						{
							active: true,
							currentWindow: true
						},
						function(tabs)
						{
							chrome.tabs.sendMessage(
								tabs[0].id,
								{
									from: "background",
									action: "setPassword",
									password: pass
								}
							);
						}
					);

				},
				function (err)
				{

				}
			);
		});
	}
});
