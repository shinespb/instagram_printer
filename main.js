const serial = chrome.serial;

var ba_errorcodes = {
  32: "Motor Failure",
  33: "CheckSum Error",
  34: "Bill Jam",
  35: "Bill Remove",
  36: "Stacker Open",
  37: "Sensor Problem",
  38: "Unknown error",
  39: "Bill Fish",
  40: "Stacker Problem",
  41: "Bill Reject"
};
var ba_firstline = {
  128: "bootup",
  41: "bill reject",
  38: "communication error",
  16: "bill accept finish",
  17: "bill accept failure"
};
var ba_roubles = {
  64: 10,
  65: 50,
  66: 100,
  67: 500,
  68: 1000
};
var ba_sl = {
    143: "bootup, wait for reply"
}
var ba_reply = {
    'recieved_bootup_message': 02,
    'accept_payment': 02,
    'decline_payment': 15,
    'disable_device': 62
};


var sendReply = function(reply){
  var arr = [];
  var rp = String.fromCharCode(reply);
  arr.push(rp);
  log('chr: '+ rp + ', arr: '+ arr);
  //connection.send(String.fromCharCode(reply));
  connection.send(arr);
}
var checkReply = function(code){
  if (code in ba_errorcodes){
    log('Error: ' + ba_errorcodes[code]);
  }
  if (code in ba_roubles){
    log('Got money: ' + ba_roubles[code] + ' roubles');
    log('adding money');
    //addFunds(ba_roubles[code]);
    //log('try to get money');
    //getFunds();
    log('check for reply: ' + ba_reply['recieved_bootup_message']);
    sendReply(ba_reply['accept_payment']);
  }
  if (code in ba_firstline){
    log('other: ' + ba_firstline[code]);
  }
  if (code in ba_sl){
    log('Bootup: ' + ba_sl[code]);    
    log('checking for reply: ' + ba_reply['recieved_bootup_message']);

    sendReply(ba_reply['recieved_bootup_message']);
    //sendReply(int2ab(ba_reply['recieved_bootup_message']));
  }
}

var stringConChar = function(code) {
  var arr = new Uint8Array(1);
  //var res = ;
  //log('stringConChar: ' + code);
 //code));
  for (i=0; i<1; i++){
    arr[i] = String.fromCharCode(code);
  }
  return res;
}

var ab2int = function(buf) {
  var bufView = new Uint8Array(buf);

  var debugBytes = "";
  log('arr length: '+ bufView.byteLength);

  for(var i=0; i<bufView.byteLength; i++) {
    log('bufbyte: '+bufView[i]);
    debugBytes = bufView[i].toString();
  }
  log('bufdebug: ' + debugBytes);
  return debugBytes;
};


/* Converts a string to UTF-8 encoding in a Uint8Array; returns the array buffer. */
var str2ab = function(str) {
  var encodedString = unescape(encodeURIComponent(str));
  var bytes = new Uint8Array(encodedString.length);
  for (var i = 0; i < encodedString.length; ++i) {
    bytes[i] = encodedString.charCodeAt(i);
  }
  return bytes.buffer;
};

/* Interprets an ArrayBuffer as UTF-8 encoded string data. */
var ab2str = function(buf) {
  log('get from device: ' + buf);
  var bufView = new Uint8Array(buf);
  log('bufview: ' + bufView);
  var encodedString = String.fromCharCode.apply(null, bufView);
  log('encodedString: ' + encodedString);
  return decodeURIComponent(escape(encodedString));
};
////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

var SerialConnection = function() {
  this.connectionId = -1;
  this.lineBuffer = "";
  this.boundOnReceive = this.onReceive.bind(this);
  this.boundOnReceiveError = this.onReceiveError.bind(this);
  this.onConnect = new chrome.Event();
  this.onReadLine = new chrome.Event();
  this.onError = new chrome.Event();
};

SerialConnection.prototype.onConnectComplete = function(connectionInfo) {
  if (!connectionInfo) {
    log("Connection failed.");
    return;
  }
  this.connectionId = connectionInfo.connectionId;
  serial.onReceive.addListener(this.boundOnReceive);
  serial.onReceiveError.addListener(this.boundOnReceiveError);
  this.onConnect.dispatch();
};

SerialConnection.prototype.onReceive = function(receiveInfo) {
  if (receiveInfo.connectionId !== this.connectionId) {
    return;
  }

  this.lineBuffer += checkReply(ab2int(receiveInfo.data));

  var index;
  while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
    var line = this.lineBuffer.substr(0, index + 1);
    this.onReadLine.dispatch(line);
    this.lineBuffer = this.lineBuffer.substr(index + 1);
  }
};

SerialConnection.prototype.onReceiveError = function(errorInfo) {
  if (errorInfo.connectionId === this.connectionId) {
    this.onError.dispatch(errorInfo.error);
  }
};

SerialConnection.prototype.getDevices = function(callback) {
  serial.getDevices(callback)
};

SerialConnection.prototype.connect = function(path) {
  serial.connect(path, this.onConnectComplete.bind(this))
};

SerialConnection.prototype.send = function(msg) {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  serial.send(this.connectionId, str2ab(msg), function() {});
};

SerialConnection.prototype.disconnect = function() {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  
};

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////


function log(msg) {
  var buffer = document.querySelector('#buffer');
  buffer.innerHTML += msg + '<br/>';
}

function getFunds(){
  log('getting money from storage: ' + window.localStorage["money"]);
  return window.localStorage["money"];
}

function addFunds(amount){
  if (amount > 0){
    log('added '+ amount + 'money to storage');
    window.localStorage["money"] = amount;
  }
}


var connection = new SerialConnection();

connection.onConnect.addListener(function() {
  log('connected...');
  // remove the connection drop-down
  document.querySelector('#connect_box').style.display = 'none';
  document.querySelector('#control_box').style.display = 'block';
});

connection.onReadLine.addListener(function(line) {
  log('read line: ' + line);
  // if the line 'TEMPERATURE=' foo is returned, set the
  // set the button's text
  if (line.indexOf("TEMPERATURE=")==0)
    document.querySelector('#get_temperature').innerHTML = "Temp = "+line.substr(12);
});

// Populate the list of available devices
connection.getDevices(function(ports) {
  // get drop-down port selector
  var dropDown = document.querySelector('#port_list');
  // clear existing options
  dropDown.innerHTML = "";
  // add new options
  var optnum = 0;
  var subBut = document.querySelector('#connect_button');

  ports.forEach(function (port) {
    var displayName = port["displayName"] + "("+port.path+")";
    if (!displayName) displayName = port.path;
    var newOption = document.createElement("option");
    newOption.text = displayName;
    newOption.value = port.path;
    dropDown.appendChild(newOption);
    optnum += 1
  });
  if (optnum == 0){
    var newOption = document.createElement("option");
    newOption.text = "No serial devices";
    newOption.value = "";
    dropDown.appendChild(newOption);
    subBut.disabled = true;
  }
});

// Handle the 'Connect' button
document.querySelector('#connect_button').addEventListener('click', function() {
  // get the device to connect to
  var dropDown = document.querySelector('#port_list');
  var devicePath = dropDown.options[dropDown.selectedIndex].value;
  // connect
  log("Connecting to "+devicePath);
  connection.connect(devicePath);
});

document.querySelector('#disable_ba').addEventListener('click', function() {
  log('trying to disable_device');
  //sendReply(ba_reply['disable_device']);
});

document.querySelector('#enable_ba').addEventListener('click', function() {
  log('trying to enable_device');
  //sendReply(ba_reply['recieved_bootup_message']);
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('options').addEventListener('click', function() {
        chrome.tabs.update({ url: 'chrome://extensions?options=fficplojlpjnibeckkiaaebjjehkamlh' });
    });
});