setTimeout(function(){
	var fns = {slider_zoom: function () {
		var v = document.getElementById("zoomLevel").value;
		if (v < 0.3) { v = "Auto"; } else { v = (v*100).toFixed(0)+"%"; }
		document.getElementById("zoomLevelValue").innerHTML = v;
	},checkbox_smallKeyboard: function () {
		var s = document.getElementById("smallKeyboard").checked;
		document.getElementById("zoomLevelLabel").style.display = s ? "none" : "block";
	},checkbox_touchEvents: function () {
		var s = document.getElementById("touchEvents").checked;
		document.getElementById("autoTriggerPH").style.display = s ? "none" : "block";
	},slider_autoTriggerAfter: function () {
		var v = document.getElementById("autoTriggerAfter").value+" sec";
		document.getElementById("autoTriggerAfterValue").innerHTML = v;
	},checkbox_autoTrigger: function () {
		var s = !document.getElementById("autoTrigger").checked;
		document.getElementById("autoTriggerOnPH").style.display = s ? "none" : "block";
	}}
	function kl_add() {
		var o = document.getElementById("al").options;
		for (var i=0; i<o.length; i++) {
			if (o[i].selected) {
				var opt = document.createElement("option");
			    opt.text = o[i].innerHTML;
				opt.value = o[i].value;
				var os = document.getElementById("sl").options;
				var exists = false;
				for (var i2=0; i2<os.length; i2++) {
					if (os[i2].value == o[i].value) {
						exists = true;
					}
				}
				if (!exists) {
					document.getElementById("sl").options.add(opt);
				}
			}
		}
		kl_save();
	}
	function kl_save() {
		var a = new Array();
		var o = document.getElementById("sl").options;
		for (var i=0; i<o.length; i++) {
			if (o[i].value != undefined) {
				a.push({ value: o[i].value, name: o[i].innerHTML });
			}
		}
		storage["keyboardLayoutsList"] = JSON.stringify(a);
		storage["keyboardLayout1"] = a[0].value;
		document.getElementById("changeEffect").className = "show";
	}
	function kl_load() {
		if (storage["keyboardLayoutsList"] != undefined) {
			var a = JSON.parse(storage["keyboardLayoutsList"]);
			if (a.length > 0) {
				document.getElementById("sl").removeChild(document.getElementById("sl").options[0]);
				for (var i=0; i<a.length; i++) {
					var opt = document.createElement("option");
					opt.text = a[i].name;
					opt.value = a[i].value;
					if (a[i].value != undefined) {
						document.getElementById("sl").options.add(opt);
					}
				}
			}
		}
	}

	function kl_remove() {
		var o = document.getElementById("sl").options;
		if (o.length > 1) {
			for (var i=0; i<o.length; i++) {
				if (o[i].selected) {
					document.getElementById("sl").removeChild(o[i]);
				}
			}
		}
		kl_save();
	}
	document.body.className = "loaded";
	kl_load();
	document.getElementById("kl_remove").addEventListener("click", kl_remove, false);
	document.getElementById("kl_add").addEventListener("click", kl_add, false);
	var c = document.getElementsByClassName("setting");
	for (var i=0; i<c.length; i++) {
		var sk = c[i].getAttribute("_setting");	
		if (c[i].getAttribute("type") == "checkbox") {
			if ((storage[sk] == undefined) && (c[i].getAttribute("_default") != undefined)) {
				storage[sk] = c[i].getAttribute("_default");
			}
			if (storage[sk] == "true") {
				c[i].checked = true;
			}
		} if (c[i].getAttribute("type") == "range") {
			if (storage[sk] == undefined) {
				c[i].value = 0;	
			} else {
				c[i].value = storage[sk];	
			}
		} else {
			c[i].value = storage[sk];	
		}
		c[i].onchange = function() {
			var skey = this.getAttribute("_setting");	
			if (this.getAttribute("type") == "checkbox") {
				if ((storage[skey] == undefined) && (this.getAttribute("_default") != undefined)) {
					storage[skey] = this.getAttribute("_default");
				}
				storage[skey] = this.checked ? "true" : "false";
			} else {
				storage[skey] = this.value;
			}
			document.getElementById("changeEffect").className = "show";
			if (this.getAttribute("_changed") != undefined) {
				callFunc(this.getAttribute("_changed"));
			}
		}
		if (c[i].getAttribute("_changed") != undefined) {
			callFunc(c[i].getAttribute("_changed"));
		}
	}

	function callFunc(callback) {
		fns[callback]();
		// eval(callback)();
	}
}, 500);