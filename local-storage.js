(function(that){
  var __storage = {"smallKeyboard": null,"smallKeyboardTop": null,"smallKeyboardBottom": null,"smallKeyboardRight": null,"smallKeyboardLeft": null,"openedFirstTime": null,"capsLock": null,"smallKeyboard": null,"touchEvents": null,"keyboardLayout1": null,"urlButton": null,"keyboardEnabled": null,"hardwareAcceleration": null,"zoomLevel": null,"autoTrigger": null,"intelligentScroll": null,"autoTriggerLinks": null,"autoTriggerAfter": null,"keyboardEnabled": null,"keyboardEnabled": null,"keyboardEnabled": null,"keyboardEnabled": null,"keyboardEnabled": null,"keyboardEnabled": null,"keyboardEnabled": null,"keyboardEnabled": null,"keyboardEnabled": null,"toogleKeyboard": null,"keyboardEnabled":null,"keyboardLayoutsList": null,};

  chrome.storage.local.get(__storage, function(items){
    var storage;
    that.storage = storage = items;
    console.log(that.storage);
    Object.observe(that.storage, function(changes, a){
      var updateObj = {};
      changes.forEach(function(change, b){
        if(change.type === 'update' || change.type === 'add') {
          console.log(storage[change.name]);
          updateObj[change.name] = storage[change.name];
        }
      });
      if(Object.keys(updateObj).length)
        chrome.storage.local.set(updateObj, function(){
          // console.log('saved.');
        });
    });
  })

})(window);

window.addEventListener('keydown', function (e) {
  if(e.keyCode === 82 && e.metaKey)
    chrome.runtime.reload();
});