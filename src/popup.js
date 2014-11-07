window.addEventListener("load", function()
{
	/**
	 * check if username is not set
	 */
	chrome.storage.sync.get("opt:username", function(prefs)
	{
		if (prefs["opt:username"] == undefined || prefs["opt:username"].length < 1)
		{
			chrome.tabs.create(
				{
					'url': chrome.extension.getURL('options.html?error=username')
				}
			);
		}
	});

	
	/**
	 * add events
	 */
	// focus password field
	document.querySelector("input[name=password]").focus();

	// settings link
	document.querySelector("#settings").addEventListener("click", function(e)
	{
		chrome.tabs.create(
			{
				'url': chrome.extension.getURL('options.html')
			}
		);
	});


    /**
	 * load current settings
	 */
	chrome.tabs.executeScript(
		null,
		{
			code: 'document.location.host'
		},
		function(result)
		{
			options = [
				"opt:topdomain",
				"opt:template"
			];
			prefs = {};
			domain = result[0];
			chrome.storage.sync.get(options, function(p)
			{
				prefs = p;

				// set domain
				if (prefs['opt:topdomain'])
				{
					host = domain.split('.');
					if (host.length > 2)
					{
						domain = host[host.length-2] + "." + host[host.length-1];
					}
				}
				document.querySelector('#domain').value = domain;

				// set template
				if (prefs['opt:template'])
				{
					document.querySelector('#template').value = prefs['opt:template'];
				}
			});
		}
	);


	/**
	 * form submit handler
	 */
	document.querySelector("form").addEventListener("submit", function(e)
	{
		e.preventDefault();

		// loading icon
		document.querySelector("#submit img").style.display = "";

		// request password
		request = {
			from: "popup",
			action: "generate",
			master: document.querySelector("input[name=password]").value,
			domain: document.querySelector("input[name=domain]").value,
			template: document.querySelector("select[name=template]").value,
			counter: document.querySelector("input[name=counter]").value
		};
		chrome.runtime.sendMessage(request);
	});
});


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse)
{
	if (msg.from == "content" && msg.action == "closePopup")
	{
		// disable loading icon
		document.querySelector("#submit img").style.display = "none"

		// close window
		window.close();
	}
});