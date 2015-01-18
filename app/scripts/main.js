/**
 * add alerts to content
 */
function addAlert(type, message)
{
	dialog = $("<div></div>", {
		"class": "alert alert-dismissible alert-" + type
	}).hide();

	button = $("<button>", {
		"type": "button",
		"class": "close",
		"data-dismiss": "alert"
	});

	close = $("<span>").html("&times;");
	button.append(close);

	p = $("<p>").text(message);

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
	$('[data-i18n]').each(function()
	{
		i18n = $(this).data("i18n");
		msg = chrome.i18n.getMessage(i18n);

		if (!msg)
		{
			msg = '#' + i18n + '#';
		}

		$(this).html(msg);
	});
});