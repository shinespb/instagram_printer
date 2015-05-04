setTimeout(function(){
	window.sendRequest = function(request, sendResponse) {
		_req(request, function(response){
			setTimeout(function(){
				sendResponse(response);
			}, 100);
		});
	}
	function _req(request, sendResponse) {
	    if (request.method == "getstorage")
		{
			sendResponse({data: storage[request.key]});
		} 
		else if (request.method == "getSmallKeyboardCoords")
		{
			sendResponse({smallKeyboard: storage["smallKeyboard"], smallKeyboardTop: storage["smallKeyboardTop"], smallKeyboardBottom: storage["smallKeyboardBottom"], smallKeyboardRight: storage["smallKeyboardRight"], smallKeyboardLeft: storage["smallKeyboardLeft"]});
		}
		else if (request.method == "loadKeyboardSettings")
		{
			sendResponse({openedFirstTime: storage["openedFirstTime"], 
						capsLock: storage["capsLock"],
						smallKeyboard: storage["smallKeyboard"],
						touchEvents: storage["touchEvents"],
						keyboardLayout1: storage["keyboardLayout1"],
						urlButton: storage["urlButton"],
						keyboardEnabled: storage["keyboardEnabled"]});
		}
		else if (request.method == "initLoadKeyboardSettings")
		{
			sendResponse({hardwareAcceleration: storage["hardwareAcceleration"], 
						zoomLevel: storage["zoomLevel"],
						autoTrigger: storage["autoTrigger"],
						intelligentScroll: storage["intelligentScroll"],
						autoTriggerLinks: storage["autoTriggerLinks"],
						autoTriggerAfter: storage["autoTriggerAfter"]});
		}
		else if (request.method == "setLocalStorage")
		{
			console.log('set', request.key, request.value);
			storage[request.key] = request.value;
			sendResponse({data: "ok"});
		}	
		else if (request.method == "openFromIframe")
		{
			chrome.tabs.getSelected(null, function(tab) { 
				chrome.tabs.sendRequest(tab.id, request);
			});
		}
		else if (request.method == "clickFromIframe")
		{
			chrome.tabs.getSelected(null, function(tab) { 
				chrome.tabs.sendRequest(tab.id, request);
			});
		}
		else if (request.method == "toogleKeyboard")
		{
			if (storage["keyboardEnabled"] != "false") {
				storage["keyboardEnabled"] = "false";
			} else {
				storage["keyboardEnabled"] = "true";
			}
			chrome.tabs.getSelected(null, function(tab) { 
				// vkeyboard_loadPageIcon(tab.id);
				if (storage["keyboardEnabled"] == "false") {
					chrome.tabs.sendRequest(tab.id, "closeKeyboard");
				} else {
					chrome.tabs.sendRequest(tab.id, "openKeyboard");
				}
			})
			sendResponse({data: "ok"});
		} 
		else if (request.method == "toogleKeyboardOn")
		{
			storage["keyboardEnabled"] = "true";
			chrome.tabs.getSelected(null, function(tab) { 
				// vkeyboard_loadPageIcon(tab.id);
				chrome.tabs.sendRequest(tab.id, "openKeyboard");
			})
			sendResponse({data: "ok"});
		} 
		else if (request.method == "toogleKeyboardDemand")
		{
			storage["keyboardEnabled"] = "demand";
			chrome.tabs.getSelected(null, function(tab) { 
				// vkeyboard_loadPageIcon(tab.id);
				chrome.tabs.sendRequest(tab.id, "openKeyboard");
			})
			sendResponse({data: "ok"});
		} 
		else if (request.method == "toogleKeyboardOff")
		{
			storage["keyboardEnabled"] = "false";
			chrome.tabs.getSelected(null, function(tab) { 
				// vkeyboard_loadPageIcon(tab.id);
				chrome.tabs.sendRequest(tab.id, "closeKeyboard");
			})
			sendResponse({data: "ok"});
		} 
		else if (request.method == "openUrlBar")
		{
			chrome.tabs.getSelected(null, function(tab) { 
				chrome.tabs.sendRequest(tab.id, "openUrlBar");
				sendResponse({data: "ok" });
			});
		} 
	    else {
	      sendResponse({});
		}
	};

	// function vkeyboard_loadPageIcon(tabId) {
	// 	if (storage["keyboardEnabled"] == "demand") {
	// 		chrome.pageAction.setIcon({ tabId: tabId, path: "buttons/keyboard_2.png" }, function() { })
	// 	} else if (storage["keyboardEnabled"] != "false") {
	// 		chrome.pageAction.setIcon({ tabId: tabId, path: "buttons/keyboard_1.png" }, function() { })
	// 	} else {
	// 		chrome.pageAction.setIcon({ tabId: tabId, path: "buttons/keyboard_3.png" }, function() { })
	// 	}
	// }

	// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// 	if (storage["toogleKeyboard"] != "false") {
	// 		chrome.pageAction.show(tabId);
	// 		// vkeyboard_loadPageIcon(tabId);
	// 	} else {
	// 		storage["keyboardEnabled"] = "true";
	// 		chrome.pageAction.hide(tabId);
	// 	}
	// });
}, 0);