"use strict";

$(function()
{
	$("#version").text(chrome.runtime.getManifest().version);
});