"use strict";
/* global MPW */

/**
 * class handling communication with optional extensions
 */
function ChromePasswords()
{
	// default user preferences
	this.userPrefs = {
		"domainpart": "first",
		"template": "maximum"
	};

	// history extension
	this.historyExtensionId = "cmeaokcaickhjmmbbkkncmbmjmjnoigj";

	var sup = this;

	this.loadUserPrefs = function()
	{
		// load user preferences from storage.sync
		var options = [
			"opt:domainpart",
			"opt:template"
		];

		chrome.storage.sync.get(options, function(prefs)
		{
			for (var p in prefs)
			{
				sup.userPrefs[p.substr(4)] = prefs[p];
			}

			console.log(sup.userPrefs);
		});
	};

	this.loadUserPrefs();
}

/**
 * get (saved) domain params
 */
ChromePasswords.prototype.getDomain = function(domain, callback)
{
	// only first part of domain?
	if (this.userPrefs.domainpart == "first" && !domain.match(/^\d+\.\d+\.\d+\.\d+$/))
	{
		var host = domain.split(".");
		if (host.length > 2)
		{
			domain = host[host.length-2] + "." + host[host.length-1];
		}
	}

	// ask history storage for settings
	chrome.runtime.sendMessage(
		this.historyExtensionId,
		{
			"action": "getConfig",
			"domain": domain
		},
		function(response)
		{
			if (response === undefined)
			{
				response = {};
			}

			// add domain to response
			response.domain = domain;

			callback(response);
		}
	);
};

var CP = new ChromePasswords();



/**
 * use declarativeContent to show PageAction icon
 */
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

chrome.runtime.onInstalled.addListener(function()
{
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function()
	{
		chrome.declarativeContent.onPageChanged.addRules([matchRules]);
	});
});



/**
 * setting change listener
 */
chrome.storage.onChanged.addListener(function(changes, namespace)
{
	CP.loadUserPrefs();
});



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
				function ()
				{
					throw new Error("Password could not be generated, please open a issue at https://github.com/brightdroid/chrome-passwords");
				}
			);
		});


	}
	/**
	 * get domain config
	 */
	else if (msg.action == "getDomain")
	{
		CP.getDomain(msg.domain, function(response)
		{
			port.postMessage(response);
		});
	}
}



/**
 * extension messaging
 */
chrome.runtime.onConnect.addListener(function(port)
{
	console.log("connect", port);

	// popup channel
	if (port.name == "popup")
	{
		port.onMessage.addListener(onMessagePopup);
	}
});