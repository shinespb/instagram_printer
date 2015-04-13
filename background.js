chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('print.html', {
    id: 'print',
    bounds: { width: 640, height: 640 },
  }, function (w) {
    // w.minimize();
  });
  chrome.app.window.create('index.html', {
    id: 'main',
    bounds: { width: 620, height: 500 },
  }, function (w){
    w.focus();
    // w.fullscreen();
  });
});
