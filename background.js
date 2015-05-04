chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('print.html', {
    id: 'print',
    bounds: { width: 640, height: 640 },
  }, function (w) {
    // w.minimize();
  });
  chrome.app.window.create('options.html', {
    id: 'options',
    bounds: { width: 400, height: 37 },
  });
  chrome.app.window.create('kb/options.html', {
    id: 'kb-options',
    bounds: { width: 1024, height: 640 },
  });
  chrome.app.window.create('index.html', {
    id: 'main',
    bounds: { width: 1024, height: 640 },
  }, function (w){
    // w.fullscreen();
    w.focus();
  });

});
