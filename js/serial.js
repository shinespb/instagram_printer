const serial = chrome.serial;

var money = 0;

var ba_errorcodes = {
  32: "Motor Failure",
  33: "CheckSum Error",
  34: "Bill jam",
  35: "Bill removed",
  36: "Stacker opened",
  37: "Sensor Problem",
  38: "Unknown error",
  39: "Bill Fishing",
  40: "Stacker problem",
  41: "Bill declined",
  42: "Incorrect command",
  47: "Stacker comes back",
  62: "Bill accept enable status",
  94: "Bill Accept inhibit status"
};
var ba_firstline = {
  128: "Booting",
  129: "Bill Accepted",
  41: "Bill declined",
  38: "communication error",
  16: "Bill successfully accepted",
  17: "Bill declined 1",
  62: "Enable/Disable BA",
  48: "BA RESET"
};
var ba_roubles = {
  64: 10,
  65: 50,
  66: 100,
  67: 500,
  68: 1000
};
var ba_sl = {
    143: "Booting, wait for reply"
}
var ba_reply = {
    'recieved_bootup_message': 02,
    'accept_payment': 02,
    'status': 12,
    'decline_payment': 15,
    'disable_device': 62
};

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}



var ab2int = function(buf) {
  var bufView = new Uint8Array(buf);

  var debugBytes = "";
  //log('arr length: '+ bufView.byteLength);

  for(var i=0; i<bufView.byteLength; i++) {
    log('bufbyte: '+bufView[i]);
    debugBytes = bufView[i].toString();
  }
  //log('bufdebug: ' + debugBytes);
  return debugBytes;
};

function sendReply(reply){
  var encodedString = unescape(encodeURIComponent(String.fromCharCode(reply)));
  var bytes = new Uint8Array(encodedString.length);
  for (var i = 0; i < encodedString.length; ++i) {
    bytes[i] = encodedString.charCodeAt(i);
  }
  return bytes.buffer;
}
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
    log('Connection error. onReceive');
    return;
  }

  //this.lineBuffer += checkReply(ab2int(receiveInfo.data));
  //log('getting info');
  checkReply(ab2int(receiveInfo.data));


  // var index;
  // while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
  //   var line = this.lineBuffer.substr(0, index + 1);
  //   this.onReadLine.dispatch(line);
  //   this.lineBuffer = this.lineBuffer.substr(index + 1);
  // }
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
  //serial.connect(path, this.onConnectComplete.bind(this))
  serial.connect(path, { bitrate: 9600, dataBits: "eight", parityBit: "even", stopBits: "one" }, this.onConnectComplete.bind(this))
};

SerialConnection.prototype.send = function(msg) {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  //serial.send(this.connectionId, str2ab(msg), function() {});
  serial.send(this.connectionId, sendReply(msg), function() {});
};

SerialConnection.prototype.disconnect = function() {
  if (this.connectionId < 0) {
    throw 'Invalid connection';
  }
  
};

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

// var getMoney = function() {
//     var money = "";
//     chrome.storage.local.get('money', function(result){
//       log('getm: ' + result['money']);
//       money = result['money'];
//     });
//     return money;
//   chrome.storage.local.get({'money'}, function(mn) {
//     log('Get data: '+ mn);
//   });
// }


// function setChanges(param) {
//   // Get a value saved in a form.
//   if (!param) {
//     message('Error: No value specified');
//     return;
//   }
//   // Save it using the Chrome extension storage API.
//   chrome.storage.local.set({'money': param}, function() {
//     // Notify that we saved.
//     log('Settings saved: money: ' + param);
//   });
// }


function log(msg) {
  console.log(msg);
}

function getFunds(){
  chrome.storage.local.get('money', function(result){
    log('getMoney: ' + result['money']);
    return result['money'];
  });
}

function addFunds(amount){
  log('FUNDS: '+ getFunds())
  money = money + amount;
  // log('TotalMoney: ' + money);
  // var moneybox = document.querySelector('#money');

  // chrome.storage.local.get('money', function(result){
  //   log('getm: ' + result['money']);
  //   money = result['money'];
  // });
  chrome.storage.local.set({'money': money}, function() {
    // Notify that we saved.
    log('Settings saved: money: ' + money);
  });

  //if (amount > 0){
  //  moneybox.value += amount;
  //  log('added '+ amount + 'money to storage');
  //  //window.localStorage["money"] = amount;
  //}
}


var connection = new SerialConnection();

connection.onConnect.addListener(function() {
  log('connected...');
  // remove the connection drop-down
  // document.querySelector('#connect_box').style.display = 'none';
  // document.querySelector('#control_box').style.display = 'block';
});

// connection.onReadLine.addListener(function(line) {
//   log('read line: ' + line);
//   // if the line 'TEMPERATURE=' foo is returned, set the
//   // set the button's text
//   if (line.indexOf("TEMPERATURE=")==0)
//     document.querySelector('#get_temperature').innerHTML = "Temp = "+line.substr(12);
// });

// Populate the list of available devices 
// connection.getDevices(function(ports) {
//   // get drop-down port selector
//   var dropDown = document.querySelector('#port_list');
//   // clear existing options
//   dropDown.innerHTML = "";
//   // add new options
//   var optnum = 0;
//   var subBut = document.querySelector('#connect_button');

//   ports.forEach(function (port) {
//     var displayName = port["displayName"] + "("+port.path+")";
//     if (!displayName) displayName = port.path;
//     var newOption = document.createElement("option");
//     newOption.text = displayName;
//     newOption.value = port.path;
//     dropDown.appendChild(newOption);
//     optnum += 1
//   });
//   if (optnum == 0){
//     var newOption = document.createElement("option");
//     newOption.text = "No serial devices";
//     newOption.value = "";
//     dropDown.appendChild(newOption);
//     subBut.disabled = true;
//   }
// });