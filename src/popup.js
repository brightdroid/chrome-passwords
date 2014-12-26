/**
 * extension messaging
 */
var popupPort = chrome.extension.connect({name: "popup"});

popupPort.onMessage.addListener(function(msg)
{
	/**
	 * received password result
	 */
	if (msg.from == "background" && msg.action == "passwordResult")
	{
		// disable loading icon
		document.querySelector("#submit img").style.display = "none";

		// close window when cleartext is not checked
		if (!document.querySelector("#cleartext").checked)
		{
			setPassword(msg.password);

		}
		// show accept button & password
		else
		{
			document.querySelector("textarea[name=password]").value = msg.password;
			document.querySelector("#cleartextPass").style.display = "";
			document.querySelector("button[data-i18n=button_generate]").style.display = "";
			document.querySelector("button[data-i18n=button_accept]").style.display = "";
		}
	}
});



/**
 * function to send new password to current tab
 */
function setPassword(pass)
{
	chrome.tabs.query(
		{
			active: true,
			currentWindow: true
		},
		function(tabs)
		{
			var contentPort = chrome.tabs.connect(tabs[0].id, {name: "content"});

			contentPort.postMessage({
				from: "popup",
				action: "setPassword",
				password: pass
			});

			window.close();
		}
	);
}


/**
 *
 */
function formSubmit(btnStyle)
{

}


/**
 * popup loaded...
 */
window.addEventListener("load", function()
{
	/**
	 * check if username is empty
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
	 * add events && init
	 */
	// focus password field
	document.querySelector("input[name=master]").focus();

	// settings link
	document.querySelector("#settings").addEventListener("click", function(e)
	{
		chrome.tabs.create(
			{
				'url': chrome.extension.getURL('options.html')
			}
		);
	});

	// accept button
	document.querySelector("button[data-i18n=button_accept]").addEventListener("click", function(e)
	{
		e.preventDefault();

		setPassword(document.querySelector("textarea[name=password]").value);
	});

	// textarea
	document.querySelector("#password").addEventListener("click", function(e)
	{
		this.select();
	});

	// form submit handler
	document.querySelector("form").addEventListener("submit", function(e)
	{
		e.preventDefault();

		// hide elements & show loading icon
		document.querySelector("#cleartextPass").style.display = "none";
		document.querySelector("button[data-i18n=button_generate]").style.display = "none";
		document.querySelector("button[data-i18n=button_accept]").style.display = "none";
		document.querySelector("#submit img").style.display = "";

		// request password
		request = {
			from: "popup",
			action: "generate",
			master: document.querySelector("input[name=master]").value,
			domain: document.querySelector("input[name=domain]").value,
			template: document.querySelector("select[name=template]").value,
			counter: document.querySelector("input[name=counter]").value
		};

		popupPort.postMessage(request);
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

				// prefill domain
				if (prefs['opt:topdomain'])
				{
					host = domain.split('.');
					if (host.length > 2)
					{
						domain = host[host.length-2] + "." + host[host.length-1];
					}
				}
				document.querySelector('#domain').value = domain;

				// select template
				if (prefs['opt:template'])
				{
					document.querySelector('#template').value = prefs['opt:template'];
				}
			});
		}
	);
});
