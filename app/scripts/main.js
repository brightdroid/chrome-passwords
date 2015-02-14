/**
 * add alerts to content
 */
function addAlert(type, message)
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

	var p = $("<p>").text(message);

	dialog.append(button);
	dialog.append(p);

	dialog.insertAfter(".content h2");

	dialog
		.slideDown()
		.delay(3000)
		.slideUp(function()
		{
			$(this).remove();
		});
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