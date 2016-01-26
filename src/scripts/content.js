function ChromePasswordsContent()
{
	this.dataFieldName = "chrome-passwords";
	this.enabledFields = [];
	this.disabledFields = [];
}


/**
 * init password fields
 */
ChromePasswordsContent.prototype.initFields = function(context)
{
	var fields = $(":password", context);
	var self = this;

	console.log("initFields: ", context, fields.length);

	fields.each(function(i)
	{
		// not a password field?
		if (!$(this).is(":password"))
		{
			return;
		}

		// disabled?
		if ($.inArray(this, self.disabledFields) > -1)
		{
			console.log("already disabled:", this);
			return;
		}

		// enable field
		self.enableField(this);
	});

	console.log("fields:", self.enabledFields, self.disabledFields);
};


/**
 * enable CP for this password field
 */
ChromePasswordsContent.prototype.enableField = function(elm)
{
	// set styles and attr
	$(elm)
		.attr("title", chrome.i18n.getMessage("app_title"))
		.data(this.dataFieldName, 1)
		.css({
			"background-image": "url(" + chrome.extension.getURL("images/icon38.png") + ")",
			"background-position": "100% 50%",
			"background-repeat": "no-repeat",
			"background-size": "contain",
		});

	// add to enabled list
	if ($.inArray(elm, this.enabledFields) === -1)
	{
		this.enabledFields.push(elm);
	}

	// remove from disabled list
	var index = $.inArray(elm, this.disabledFields);
	if (index > -1)
	{
		this.disabledFields.splice(index, 1);
	}
};


/**
 * disable CP for this password field
 */
ChromePasswordsContent.prototype.disableField = function(elm)
{
	$(elm)
		.data(this.dataFieldName, 0)
		.css("background-position-x", "-100px");

	// add to disabled list
	this.disabledFields.push(elm);

	// remove from enabled list
	var index = $.inArray(elm, this.enabledFields);
	if (index > -1)
	{
		this.enabledFields.splice(index, 1);
	}
};


/**
 * toggle CP for this password field
 */
ChromePasswordsContent.prototype.toggle = function(elm)
{
	// disable
	if ($.inArray(elm, this.enabledFields) > -1)
	{
		this.disableField(elm);

	}
	// enable
	else if ($.inArray(elm, this.disabledFields) > -1)
	{
		this.enableField(elm);
	}

	console.log("fields:", this.enabledFields, this.disabledFields);
};


/**
 * update password in enabled password fields
 */
ChromePasswordsContent.prototype.updatePassword = function(password)
{
	var self = this;

	$(":password").each(function()
	{
		if ($.inArray(this, self.enabledFields) > -1)
		{
			console.log("updatePassword", this);

			$(this).val(password);
		}
	}).change();
};


var CPC = new ChromePasswordsContent();


/**
 * init password fields
 */
CPC.initFields();


/**
 * attach dblclick to password fields
 */
$(document).on("dblclick", ":password", function(e)
{
	console.log("toggle", this);
	CPC.toggle(this);
});


/**
 * attach focus event
 */
$(document).on("focus", "input", function(e)
{
	console.log("focus new", this);
	CPC.initFields();
});



/**
 * extension messaging
 */
chrome.runtime.onConnect.addListener(function(port)
{
	port.onMessage.addListener(function(msg)
	{
		console.log(msg);

		if (msg.action === "setPassword")
		{
			CPC.updatePassword(msg.password);
		}
	});
});