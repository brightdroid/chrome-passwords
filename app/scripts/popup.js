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
var bgPort = chrome.runtime.connect({name: "background"});

bgPort.onMessage.addListener(function(msg)
{
	console.log("msg", msg);
	/**
	 * check if username is set && prefill form
	 */
	if (msg.called == "getPrefs")
	{
		if (msg.data.username === undefined || msg.data.username.length === 0)
		{
			chrome.tabs.create({
				"url": chrome.extension.getURL("options.html?error=username")
			});
		}

		$.each(msg.data, function(k, v)
		{
			$("[data-option='" + k + "']").val(v);
		});


	}
	/**
	 * updated form with new domain settings
	 */
	else if (msg.called == "getDomainPrefs")
	{
		$("#domain").val(msg.data.domain);
		$("#counter").val(msg.data.counter);
		$("#template").val(msg.data.template);

	}
	/**
	 * received password
	 */
	else if (msg.called == "generatePassword")
	{
		// disable loading icon
		$("#submit img").addClass("hidden");

		// close window when cleartext is not checked
		if (!$("#cleartext").is(":checked"))
		{
			setPassword(msg.data.password);

		}
		// show accept button & password
		else
		{
			$("textarea[name=password]").val(msg.data.password);
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
	bgPort.postMessage({action: "getPrefs"});

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
		bgPort.postMessage({
			action: "generatePassword",
			master: $("input[name=master]").val(),
			domain: $("input[name=domain]").val(),
			template: $("select[name=template]").val(),
			counter: $("input[name=counter]").val()
		});
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
			bgPort.postMessage({
				action: "getDomainPrefs",
				domain: result[0]
			});
		}
	);
});
