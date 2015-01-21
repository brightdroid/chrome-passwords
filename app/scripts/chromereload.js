"use strict";

var LIVERELOAD_HOST = "localhost:";
var LIVERELOAD_PORT = 35731;
var livereloadSocket = new WebSocket("ws://" + LIVERELOAD_HOST + LIVERELOAD_PORT + "/livereload");

livereloadSocket.onerror = function (error)
{
	console.log("reload connection got error" + JSON.stringify(error));
};

livereloadSocket.onmessage = function (e)
{
	if (e.data)
	{
		var data = JSON.parse(e.data);

		if (data && data.command === "reload")
		{
			chrome.runtime.reload();
		}
	}
};
