var $devices = document.getElementById('devices');
var $status = document.getElementById('status');
var DEFAULT_DEVICE = '/dev/tty.usbserial';


$devices.addEventListener('change', function () {
  chrome.storage.local.set({
    devicePath: $devices.value,
  }, saved);
});

function saved (){
  $status.textContent = '..saved';
  setTimeout(function(){
    $status.textContent = '';
  }, 750)
}

function update () {
  var devices;
  connection.getDevices(function (items) {
    devices = items.map(function(item){return item.path});
    $devices.innerHTML = '<option value="">No device selected</option><option value="'+DEFAULT_DEVICE+'">Default '+DEFAULT_DEVICE+'</option>';
    devices.forEach(function (path) {
      var $opt = document.createElement('option');
      $opt.value = $opt.textContent = path;
      $devices.appendChild($opt);
    });
    devices.push(DEFAULT_DEVICE);
  });

  chrome.storage.local.get('devicePath', function(items){
    if(~devices.indexOf(items.devicePath))
      $devices.value = items.devicePath;
    else if (items.devicePath === '')
      $devices.value = '';
    else {
      $devices.value = DEFAULT_DEVICE;
      chrome.storage.local.set({
        devicePath: DEFAULT_DEVICE,
      }, saved);
    }
  });
}

update();