/* global addAlert */


/**
 * edit domain
 */
function editDomain(e)
{
	var row = $(e.target).closest("tr");

	$("#domain").val(row.children("td:nth-child(1)").text());
	$("#counter").val(row.children("td:nth-child(2)").text());
	$("#template").val(row.children("td:nth-child(3)").data("value"));

	$("#modal_edit").modal("show");
}


/**
 * delete domain
 */
function deleteDomain(e)
{
	var row = $(e.target).closest("tr");

	$("#domain").val(row.children("td:nth-child(1)").text());

	$("#modal_delete").modal("show");
}


/**
 * extension messaging
 */
var bgPort = chrome.runtime.connect({name: "background"});

bgPort.onMessage.addListener(function(msg)
{
	console.log("msg", msg);

	/**
	 * update table with all Domains from history extension
	 */
	if (msg.called === "extension" && msg.subcall === "getDomains")
	{
		// history extension not installed
		if (msg.data === undefined)
		{
			$(".jumbotron").removeClass("hidden");
			return;
		}

		// show heading and table
		$("#table-domains, .sub-header").removeClass("hidden");

		// empty table
		$("#table-domains tbody").html("");

		// add entries
		$.each(msg.data, function(k, v)
		{
			var tr = $("<tr>");
			var parts = v.split(":");

			tr.append($("<td>").text(k));
			tr.append($("<td>").text(parts[0]));
			tr.append($("<td>")
				.text(chrome.i18n.getMessage("template_" + parts[1]))
				.data("value", parts[1])
			);
			tr.append($("<td>"));

			tr.appendTo("#table-domains tbody");
		});

		$("#table-domains tbody td:nth-child(4)")
			.append($("<button>", {
					"type": "button",
					"class": "btn btn-default"
				})
					.click(editDomain)
				.append($("<span>", {
						"class": "glyphicon glyphicon-pencil"
					})
				)
			)
			.append(" ")
			.append($("<button>", {
					"type": "button",
					"class": "btn btn-default"
				})
					.click(deleteDomain)
				.append($("<span>", {
						"class": "glyphicon glyphicon-trash"
					})
				)
			);


	}
	/**
	 * save domain response
	 */
	else if (msg.called === "extension" && msg.extension === "history" && msg.subcall === "saveDomain")
	{
		if (msg.data.alert)
		{
			addAlert(msg.data.alert.type, chrome.i18n.getMessage(msg.data.alert.msg));

		}
		else
		{
			addAlert("success", chrome.i18n.getMessage("alert_form_save"));
		}


	}
	/**
	 * received license from history extension
	 */
	else if (msg.called === "extension" && msg.extension === "history" && msg.subcall === "getLicenseInfo")
	{
		if (!msg.data)
		{
			return;
		}

		switch (msg.data.license)
		{
			case "FREE_TRIAL":
				// show hint 3 days before trial expires
				var daysUntil = Math.round(msg.data.trialDays - msg.data.licenseDays);
				if (daysUntil <= 3)
				{
					var buyButton = $("<a>", {
						"class": "btn btn-info",
						"href": "https://chrome.google.com/webstore/detail/cmeaokcaickhjmmbbkkncmbmjmjnoigj",
						"target": "_blank"
					}).text(chrome.i18n.getMessage("button_upgrade"));

					addAlert(
						"info",
						chrome.i18n.getMessage("alert_ext_history_trial_long", [daysUntil]),
						[buyButton]
					);
				}
				break;

			case "FREE_TRIAL_EXPIRED":
				var upgradeButton = $("<a>", {
					"class": "btn btn-warning",
					"href": "https://chrome.google.com/webstore/detail/cmeaokcaickhjmmbbkkncmbmjmjnoigj",
					"target": "_blank"
				}).text(chrome.i18n.getMessage("button_upgrade"));

				addAlert(
					"warning",
					chrome.i18n.getMessage("alert_ext_history_trial_expired_long"),
					[upgradeButton]
				);
				break;
		}
	}
});




$(function()
{
	/**
	 * load list
	 */
	function updateList()
	{
		bgPort.postMessage({
			extension: "history",
			action: "extension",
			subaction: "getDomains"
		});
	}

	updateList();


	/**
	 * check license
	 */
	bgPort.postMessage({
		action: "extension",
		extension: "history",
		subaction: "getLicenseInfo"
	});

	/**
	 * add events
	 */
	// modal edit: save
	$("#modal_edit :submit").click(function()
	{
		bgPort.postMessage({
			extension: "history",
			action: "extension",
			subaction: "saveDomain",
			domain: $("#domain").val(),
			counter: $("#counter").val(),
			template: $("#template").val()
		});

		$("#modal_edit").modal("hide");

		updateList();
	});

	// modal delete: save
	$("#modal_delete :submit").click(function()
	{
		bgPort.postMessage({
			extension: "history",
			action: "extension",
			subaction: "deleteDomain",
			domain: $("#domain").val()
		});

		$("#modal_delete").modal("hide");

		addAlert("success", chrome.i18n.getMessage("alert_form_save"));

		updateList();
	});

});
