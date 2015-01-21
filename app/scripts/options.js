"use strict";
/* global addAlert */


$(function()
{
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
		chrome.storage.sync.set(values);

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


	/**
	 * find options
	 */
	var options = [];
	$("[data-option]").each(function(i)
	{
		options[i] = $(this).data("option");
	});


    /**
	 * load current settings
	 */
    chrome.storage.sync.get(options, function(prefs)
    {
		$.each(prefs, function(k, v)
		{
			$("[data-option='" + k + "']").val(v);
		});
    });

});


$(window).on("beforeunload", function (e)
{
	if ($("input:invalid").length > 0)
	{
		return chrome.i18n.getMessage("alert_input_invalid");
	}
});
