/* global addAlert */

/**
 * extension messaging
 */
var bgPort = chrome.runtime.connect({name: "background"});


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
				action: "setPassword",
				password: pass
			});

			// save domain settings
			bgPort.postMessage({
				action: "extension",
				extension: "history",
				subaction: "saveDomain",
				domain: $("#domain").val(),
				template: $("#template").val(),
				counter: $("#counter").val()
			});
		}
	);
}



/**
 * extension messaging
 */
bgPort.onMessage.addListener(function(msg)
{
	console.log("msg", msg);
	/**
	 * check if username is set
	 */
	if (msg.called === "getPrefs")
	{
		if (msg.data.username === undefined || msg.data.username.length === 0)
		{
			chrome.tabs.create({
				"url": chrome.extension.getURL("options.html?error=username")
			});
		}


	}
	/**
	 * updated form with new domain settings
	 */
	else if (msg.called === "getDomainPrefs")
	{
		$.each(msg.data, function(k, v)
		{
			$("#" + k).val(v);
		});


	}
	/**
	 * received password
	 */
	else if (msg.called === "generatePassword")
	{
		// enable form elements
		$("form :input:not(button)").attr("disabled", false);

		// disable loading icon
		$("#submit img").addClass("hidden");

		// close window when cleartext is not checked
		if (!$("#cleartext").is(":checked") && !msg.alert)
		{
			setPassword(msg.data.password);

		}
		// show accept button & password
		else
		{
			// alert?
			if (msg.alert)
			{
				addAlert(msg.alert.type, msg.alert.message);
			}

			if (msg.data.password)
			{
				$("textarea[name=password]").val(msg.data.password);
				$("#password").parent().removeClass("hidden");
			}

			$("#submit button").removeClass("hidden");
		}


	}
	/**
	 * received result from history extension saveDomain
	 */
	else if (msg.called === "extension" && msg.extension === "history" && msg.subcall === "saveDomain")
	{
		if (msg.data.alert)
		{
			$(".alert, form").remove();

			addAlert(
				msg.data.alert.type,
				chrome.i18n.getMessage(msg.data.alert.msg)
			);

		}
		else
		{
			window.close();
		}


	}
	/**
	 * received license from history extension
	 */
	else if (msg.called === "extension" && msg.extension === "history" && msg.subcall === "getLicenseInfo")
	{
		if (!msg.data)
		{
			return;
		}

		switch (msg.data.license)
		{
			case "FREE_TRIAL":
				// show hint 3 days before trial expires
				var daysUntil = Math.round(msg.data.trialDays - msg.data.licenseDays);
				if (daysUntil <= 3)
				{
					addAlert(
						"info",
						chrome.i18n.getMessage("alert_ext_history_trial", [daysUntil])
					);
				}
				break;

			case "FREE_TRIAL_EXPIRED":
				var upgradeButton = $("<a>", {
					"class": "btn btn-warning",
					"href": chrome.extension.getURL("domains.html"),
					"target": "_blank"
				}).text(chrome.i18n.getMessage("button_upgrade"));

				addAlert(
					"warning",
					chrome.i18n.getMessage("alert_ext_history_trial_expired"),
					[ upgradeButton ]
				);
				break;
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
	bgPort.postMessage({action: "getPrefs"});


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
			bgPort.postMessage({
				action: "getDomainPrefs",
				domain: result[0]
			});
		}
	);


	/**
	 * check license
	 */
	bgPort.postMessage({
		action: "extension",
		extension: "history",
		subaction: "getLicenseInfo"
	});


	/**
	 * add events && init
	 */
	// focus password field
	$("input:first").focus();

	// settings link
	$("#settings").click(function(e)
	{
		e.preventDefault();

		chrome.tabs.create({
			"url": chrome.extension.getURL("options.html")
		});
	});

	// input change event
	$(":input[required]").change(function()
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
	$("#domain").change(function()
	{
		bgPort.postMessage({
			action: "getDomainPrefs",
			domain: $(this).val()
		});
	});

	// accept button
	$("button[data-i18n=button_accept]").click(function(e)
	{
		e.preventDefault();

		setPassword($("#password").val());
	});

	// textarea
	$("#password").click(function()
	{
		$(this).select();
	});

	// form submit handler
	$("form").submit(function(e)
	{
		e.preventDefault();

		// hide elements & show loading icon
		$("form :input:not(button)").attr("disabled", true);
		$("#password").parent().addClass("hidden");
		$("#submit button").addClass("hidden");
		$("#submit img").removeClass("hidden");

		// request password
		bgPort.postMessage({
			action: "generatePassword",
			master: $("#master").val(),
			domain: $("#domain").val(),
			template: $("#template").val(),
			counter: $("#counter").val()
		});
	});

});
