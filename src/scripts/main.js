/**
 * add alerts to content
 */
function addAlert(type, message, buttons)
{
	var dialog = $("<div></div>", {
		"class": "alert alert-dismissible alert-" + type
	}).hide();

	var button = $("<button>", {
		"type": "button",
		"class": "close",
		"data-dismiss": "alert"
	});

	var close = $("<span>").html("&times;");
	button.append(close);

	var p = $("<p>").html(message);

	dialog.append(button);
	dialog.append(p);

	if (buttons !== undefined)
	{
		p = $("<p>");

		for (var n in buttons)
		{
			p.append(buttons[n]);
		}
		
		dialog.append(p);
	}

	dialog
		.prependTo(".content")
		.slideDown();
}



$(function()
{
	/**
	 * external links
	 */
	$("a[href^=http]").attr("target", "_blank");


	/**
	 * i18n HTML wrapper
	 */
	$("[data-i18n]").each(function()
	{
		var i18n = $(this).data("i18n");
		var msg = chrome.i18n.getMessage(i18n);

		if (!msg)
		{
			msg = "#" + i18n + "#";
		}

		$(this).html(msg);
	});
});