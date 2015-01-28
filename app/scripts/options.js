"use strict";
/* global addAlert */


/**
 * extension messaging
 */
var bgPort = chrome.runtime.connect({name: "background"});

bgPort.onMessage.addListener(function(msg)
{
	console.log("msg", msg);
	/**
	 * prefill form with user prefs
	 */
	if (msg.called == "getPrefs")
	{
		$.each(msg.data, function(k, v)
		{
			$("[data-option='" + k + "']").val(v);
		});
	}
});




$(function()
{
	/**
	 * load current settings
	 */
	bgPort.postMessage({"action": "getPrefs"});


	/**
	 * add events
	 */
	// focus username
	$("#username").focus();

	// submit button
	$("button[type=submit]").click(function(e)
	{
		e.preventDefault();

		$("form").submit();
	});

	// form submit
	$("form").submit(function(e)
	{
		e.preventDefault();

		// error!
		if ($("input:invalid").length > 0)
		{
			addAlert("danger", chrome.i18n.getMessage("alert_form_error"));
			return false;
		}

		$("button[type=submit]").focus();

		// save...
		var values = {};
		$("[data-option]").each(function()
		{
			values[$(this).data("option")] = $(this).val();
		});
		bgPort.postMessage({
			"action": "savePrefs",
			"data": values
		});

		addAlert("success", chrome.i18n.getMessage("alert_form_save"));
	});

	// input validation
	$(":input").not("buttton").change(function()
	{
		var formGroup = $(this).closest(".form-group");

		if ($(this).is(":invalid"))
		{
			formGroup.addClass("has-error");
		}
		else
		{
			formGroup.removeClass("has-error");
		}
	});
});


$(window).on("beforeunload", function (e)
{
	if ($("input:invalid").length > 0)
	{
		return chrome.i18n.getMessage("alert_input_invalid");
	}
});
