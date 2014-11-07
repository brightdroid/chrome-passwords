window.addEventListener("load", function()
{
	/**
	 * add events
	 */
	// focus username
	document.querySelector("#username").focus();

	// save button
	document.querySelector('form div button').addEventListener("click", function()
	{
		document.querySelector('form').submit();
	});

	// form submit
	document.querySelector('form').addEventListener("submit", function(e)
	{
		e.preventDefault();

		// save if everything is valid
		if (document.querySelectorAll("input:invalid").length == 0)
		{
			fields = document.querySelectorAll('[data-option]');

			values = {}
			for (i = 0; i < fields.length; i++)
			{
				switch (fields[i].getAttribute("type"))
				{
					case "checkbox":
						val = fields[i].checked;
						break;

					default:
						val = fields[i].value;
						break;
				}

				values[fields[i].getAttribute("data-option")] = val;
			}

			chrome.storage.sync.set(values);

			window.close();
		}
	});


	/**
	 * find options
	 */
	matches = document.querySelectorAll('[data-option]');
	options = [];
	for (i = 0; i < matches.length; i++)
	{
		// add field to options array
		options[i] = matches[i].getAttribute("data-option");
	}


    /**
	 * load current settings
	 */
    chrome.storage.sync.get(options, function(prefs)
    {
		for (n in prefs)
		{
			elm = document.querySelectorAll("[data-option='" + n + "']");

			if (elm.length == 1)
			{
				switch (elm[0].getAttribute("type"))
				{
					case "checkbox":
						elm[0].checked = prefs[n];
						break;

					default:
						elm[0].value = prefs[n];
						break;
				}
			}
		}
    });

});


window.onbeforeunload = function (e)
{
	if (document.querySelectorAll("input:invalid").length > 0)
	{
		return chrome.i18n.getMessage("alert_input_invalid");
	}
};
