setTimeout(function() {
	document.getElementById("toggleOn").onclick = function() {
		sendRequest({method: "toogleKeyboardOn"}, function(response) {
			window.close();	
		});
	}
	document.getElementById("settings").onclick = function() {
		window.open("kb/options.html");
	}
	document.getElementById("toggleOff").onclick = function() {
		sendRequest({method: "toogleKeyboardOff"}, function(response) {
			window.close();	
		});
	}
	document.getElementById("toggleDemand").onclick = function() {
		sendRequest({method: "toogleKeyboardDemand"}, function(response) {
			window.close();	
		});
	}
	document.getElementById("goToUrl").onclick = function() {
		sendRequest({method: "openUrlBar"}, function(response) {
			eval(callback)(response.data);
		});
		window.close();
	}
if (storage["keyboardEnabled"] == "demand") {
	document.getElementById("toggleDemand").className = "active";
} else if (storage["keyboardEnabled"] != "false") {
	document.getElementById("toggleOn").className = "active";
} else {
	document.getElementById("toggleOff").className = "active";
}

}, 50);
