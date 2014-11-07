/**
 * found password fields? show PageAction icon
 */
//if (document.querySelector("input[type=password]"))
//{
	chrome.runtime.sendMessage({
		from: "content",
		action: "showPageAction"
	});
//}


/**
 * extension messaging
 */
chrome.runtime.onMessage.addListener(function(msg, sender, response)
{
    if (msg.from == "background" && msg.action === "setPassword")
	{
		// update password fields
		var fields = document.querySelectorAll("input[type=password]")

		for (i=0; i < fields.length; i++)
		{
			fields[i].value = msg.password;
		}

		// close popup
		chrome.runtime.sendMessage({
			from: "content",
			action: "closePopup"
		});
    }
});