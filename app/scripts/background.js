/* global MPW */

/**
 * class handling communication with optional extensions
 */
function ChromePasswords()
{
	/**
	 * config
	 */
	// default user preferences
	this.userPrefs = {
		"username": "",
		"domainpart": "first",
		"template": "maximum"
	};

	// user defined templates
	this.templates = {};

	// extensions
	this.extensions = {
		history: "cmeaokcaickhjmmbbkkncmbmjmjnoigj"
	};


	/**
	 * inital user prefs loading
	 */
	var options = [
		"prefs",
		"templates"
	];

	var sup = this;
	chrome.storage.sync.get(options, function(prefs)
	{
		for (var k in prefs)
		{
			switch (k)
			{
				case "prefs":
					sup.userPrefs = prefs[k];
					break;

				case "templates":
					sup.templates = prefs[k];
					break;
			}
		}
	});
}


/**
 * get userPrefs
 */
ChromePasswords.prototype.getUserPrefs = function()
{
	return this.userPrefs;
};


/**
 * get domain prefs
 */
ChromePasswords.prototype.getDomainPrefs = function(domain, callback)
{
	// only first part of domain?
	if (this.userPrefs.domainpart === "first" && !domain.match(/^\d+\.\d+\.\d+\.\d+$/))
	{
		var host = domain.split(".");
		if (host.length > 2)
		{
			domain = host[host.length-2] + "." + host[host.length-1];
		}
	}

	// ask history storage for settings
	var sup = this;
	this.queryExtension(
		"history",
		{
			action: "getDomain",
			domain: domain
		},
		function(response)
		{
			if (response === undefined)
			{
				response = {};
			}

			if (response.counter === undefined)
			{
				response.counter = 1;
			}

			if (response.template === undefined)
			{
				response.template = sup.userPrefs.template;
			}

			// add domain to response
			response.domain = domain;

			console.log(response);

			callback(response);
		}
	);
};


/**
 * query extension
 */
ChromePasswords.prototype.queryExtension = function(extension, request, callback)
{
	chrome.runtime.sendMessage(
		this.extensions[extension],
		request,
		callback
	);
};

var CP = new ChromePasswords();



/**
 * extension load event
 */
chrome.runtime.onInstalled.addListener(function()
{
	// use declarativeContent to show PageAction icon
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function()
	{
		var matchRules = {
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					css: ["input[type=password]"]
				})
			],
			actions: [
				new chrome.declarativeContent.ShowPageAction()
			]
		};
		chrome.declarativeContent.onPageChanged.addRules([matchRules]);
	});
});



/**
 * storage change listener
 */
chrome.storage.onChanged.addListener(function(changes/*, namespace*/)
{
	for (var key in changes)
	{
		switch (key)
		{
			case "prefs":
				CP.userPrefs = changes[key].newValue;
				break;

			case "templates":
				CP.templates = changes[key].newValue;
				break;
		}
	}
});



/**
 * extension messaging
 */
chrome.runtime.onConnect.addListener(function(port)
{
	if (port.name !== "background")
	{
		return;
	}

	port.onMessage.addListener(function(msg)
	{
		console.log("msg", msg);
		/**
		* get domain config
		*/
		if (msg.action === "getDomainPrefs" && msg.domain)
		{
			CP.getDomainPrefs(msg.domain, function(response)
			{
				port.postMessage({
					called: msg.action,
					data: response
				});
			});


		}
		/**
		* get userPrefs
		*/
		else if (msg.action === "getPrefs")
		{
			port.postMessage({
				called: msg.action,
				data: CP.userPrefs
			});


		}
		/**
		 * save prefs
		 */
		else if (msg.action === "savePrefs" && msg.data)
		{
			chrome.storage.sync.set({
				prefs: msg.data
			});


		}
		/**
		* get templates
		*/
		else if (msg.action === "getTemplates")
		{
			port.postMessage({
				called: msg.action,
				data: CP.templates
			});


		}
		/**
		* call subaction in sub-extension
		*/
		else if (msg.action === "extension" && msg.extension && msg.subaction)
		{
			var params = $.extend({}, msg, { action: msg.subaction });
			delete params.subaction;
			delete params.extension;

			CP.queryExtension(
				msg.extension,
				params,
				function(response)
				{
					port.postMessage({
						called: msg.action,
						extension: msg.extension,
						subcall: params.action,
						data: response
					});
				}
			);


		}
		/**
		* generate password
		*/
		else if (msg.action === "generatePassword")
		{
			// correct params?
			if (!msg.master || !msg.domain || !msg.counter || !msg.template)
			{
				port.postMessage({
					called: "generatePassword",
					alert: {
						type: "danger",
						message: "Error calling generate function, wrong params!"
					}
				});

				return;
			}

			// generate master key
			var mpw = new MPW(CP.userPrefs.username, msg.master);

			// generate password
			var hasher = mpw.generatePassword(msg.domain, msg.counter, msg.template);
			hasher.then(
				function (pass)
				{
					port.postMessage({
						called: "generatePassword",
						data: {
							password: pass,
						}
					});

				},
				function ()
				{
					port.postMessage({
						called: "generatePassword",
						alert: {
							type: "danger",
							message: "Password could not be generated, please open a issue at https://github.com/brightdroid/chrome-passwords"
						}
					});
				}
			);

		}

	});
});
