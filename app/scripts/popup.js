"use strict";


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
 * extension messaging
 */
var popupPort = chrome.extension.connect({name: "popup"});

popupPort.onMessage.addListener(function(msg)
{
	console.log("popupPort", msg);

	/**
	 * received password result
	 */
	if (msg.from == "background" && msg.action == "passwordResult")
	{
		// disable loading icon
		$("#submit img").addClass("hidden");

		// close window when cleartext is not checked
		if (!$("#cleartext").is(":checked"))
		{
			setPassword(msg.password);

		}
		// show accept button & password
		else
		{
			$("textarea[name=password]").val(msg.password);
			$("#password").parent().removeClass("hidden");
			$("#submit button").removeClass("hidden");
		}
	}
});



/**
 * popup loaded...
 */
$(function()
{
	/**
	 * check if username is empty
	 */
	chrome.storage.sync.get("opt:username", function(prefs)
	{
		if (prefs["opt:username"] === undefined || prefs["opt:username"].length < 1)
		{
			chrome.tabs.create({
				"url": chrome.extension.getURL("options.html?error=username")
			});
		}
	});


	/**
	 * add events && init
	 */
	// focus password field
	$("input:first").focus();

	// change event
	$(":input[required]").change(function(e)
	{
		if ($(this).val().length < 1)
		{
			$(this).parent().addClass("has-error");
		}
		else
		{
			$(this).parent().removeClass("has-error");
		}
	});

	// domain change event
	$("#domain").blur(function()
	{
		console.log("getDomainConfig", $(this).val());

		popupPort.postMessage({
			"action": "getDomainConfig",
			"domain": $(this).val()
		});
	});

	// settings link
	$("#settings").click(function(e)
	{
		e.preventDefault();

		chrome.tabs.create({
			"url": chrome.extension.getURL("options.html")
		});
	});

	// accept button
	$("button[data-i18n=button_accept]").click(function(e)
	{
		e.preventDefault();

		setPassword($("#password").val());
	});

	// textarea
	$("#password").click(function(e)
	{
		$(this).select();
	});

	// form submit handler
	$("form").submit(function(e)
	{
		e.preventDefault();

		// hide elements & show loading icon
		$("#password").parent().addClass("hidden");
		$("#submit button").addClass("hidden");
		$("#submit img").removeClass("hidden");

		// request password
		var request = {
			from: "popup",
			action: "generate",
			master: $("input[name=master]").val(),
			domain: $("input[name=domain]").val(),
			template: $("select[name=template]").val(),
			counter: $("input[name=counter]").val()
		};

		popupPort.postMessage(request);
	});


    /**
	 * load current settings
	 */
	chrome.tabs.executeScript(
		null,
		{
			code: "document.location.host"
		},
		function(result)
		{
			var options = [
				"opt:domainpart",
				"opt:template"
			];
			var domain = result[0];

			chrome.storage.sync.get(options, function(p)
			{
				var prefs = p;

				// prefill domain
				if (prefs["opt:domainpart"] == "first" && !domain.match(/^\d+\.\d+\.\d+\.\d+$/))
				{
					var host = domain.split(".");
					if (host.length > 2)
					{
						domain = host[host.length-2] + "." + host[host.length-1];
					}
				}
				$("#domain").val(domain);

				// select template
				if (prefs["opt:template"])
				{
					$("#template").val(prefs["opt:template"]);
				}
			});
		}
	);
});
