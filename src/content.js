/**
 * show PageAction icon
 */
var contentPort = chrome.runtime.connect({name: "content"});

contentPort.postMessage({
	from: "content",
	action: "showPageAction"
});



/**
 * password field selection
 */
function toggleMPW(e)
{
	elm = e.target;
	val = elm.getAttribute("data-mpw");

	// disable
	if (val && val == "true")
	{
		elm.style.backgroundPositionX = "-100px";
		elm.setAttribute("data-mpw", false);

	}
	// enable
	else
	{
		elm.style.backgroundImage = "url(" + chrome.extension.getURL("res/icon38.png") + ")";
		elm.style.backgroundPosition = "100% 50%";
		elm.style.backgroundRepeat = "no-repeat";
		elm.style.backgroundSize = "contain";
		elm.setAttribute("data-mpw", true);
	}
}



/**
 * add event handler
 */
var fields = document.querySelectorAll("input[type=password]");
for (i = 0; i < fields.length; i++)
{
	fields[i].addEventListener("dblclick", toggleMPW);
}



/**
 * extension messaging
 */
chrome.runtime.onConnect.addListener(function(port)
{
	port.onMessage.addListener(function(msg)
	{
		if (msg.from == "popup" && msg.action === "setPassword")
		{
			// are there selected fields?
			fields = document.querySelectorAll("input[type=password][data-mpw=true]");

			// no selected fields found, find all
			if (fields.length == 0)
			{
				fields = document.querySelectorAll("input[type=password]")
			}

			// update values
			for (i=0; i < fields.length; i++)
			{
				fields[i].value = msg.password;
			}
		}
	});
});