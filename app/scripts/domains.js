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
	if (msg.called === "getAllDomains")
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
});




$(function()
{
	/**
	 * load current settings
	 */
	bgPort.postMessage({"action": "getAllDomains"});


	/**
	 * add events
	 */
	// modal edit: save
	$("#modal_edit :submit").click(function()
	{
		bgPort.postMessage({
			action: "saveDomainPrefs",
			domain: $("#domain").val(),
			counter: $("#counter").val(),
			template: $("#template").val()
		});

		$("#modal_edit").modal("hide");

		addAlert("success", chrome.i18n.getMessage("alert_form_save"));

		bgPort.postMessage({"action": "getAllDomains"});
	});

	// modal delete: save
	$("#modal_delete :submit").click(function()
	{
		bgPort.postMessage({
			action: "deleteDomainPrefs",
			domain: $("#domain").val()
		});

		$("#modal_delete").modal("hide");

		addAlert("success", chrome.i18n.getMessage("alert_form_save"));

		bgPort.postMessage({"action": "getAllDomains"});
	});

});
