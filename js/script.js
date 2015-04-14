var app = angular.module("InstaBoo", []);

// Creamos y registramos el nuevo servicio de instagram
app.factory('instagram', ['$http', function($http){
  var CLIENT_ID = '2792e28fe18f421593db05b3180c1b1f',
      ACCESS_TOKEN,
      ROOT_URL = 'https://api.instagram.com/v1/',
      __;

  // auth();

  function req (cfg) {
    cfg.params || (cfg.params = {});
    angular.extend(cfg.params, {
      client_id: CLIENT_ID,
      // access_token: ACCESS_TOKEN,
      // callback: 'JSON_CALLBACK'
    });
    // cfg.method = 'jsonp';
    cfg.url = ROOT_URL + cfg.url;
    return wrap($http(cfg), cfg);
  }

  // function auth (){
  //   var redirectUrl = chrome.identity.getRedirectURL();
  //   var clientId = "9eef41a4b67c42478d260b29e68434cf";
  //   var authUrl = "https://instagram.com/oauth/authorize/?" +
  //       "client_id=" + clientId + "&" +
  //       "response_type=token&" +
  //       "redirect_uri=" + encodeURIComponent(redirectUrl);

  //   chrome.identity.launchWebAuthFlow({url: authUrl, interactive: false}, function(responseUrl) {
  //     ACCESS_TOKEN = responseUrl.substring(responseUrl.indexOf("=") + 1);
  //     console.log(ACCESS_TOKEN);
  //   });
  // }

  function wrap (xhr, cfg) {
    var d = [];
    d.$success = false;
    d.$error = false;
    d.$pending = false;

    xhr.success(function(data){
      d.$success = true;
      if(data.data){
        data = data.data
        if(angular.isArray(data)) {
          Array.prototype.push.apply(d, data);
          if(cfg.sortBy) {
            d.sort(function(a, b){
              return a[cfg.sortBy] > b[cfg.sortBy];
            });
          }
        }
        else {
          angular.extend(d, data);
        }
      }
    });
    xhr.error(function(data, status){
      d.$error = data || status;
    });
    xhr['finally'](function(){
      d.$pending = false;
    });
    d.$promise = xhr;
    return d;
  }

  return {
    searchUsers: function (userName) {
      return req({
        url: 'users/search?q=' + userName,
        sortBy: 'username',
      });
    },
    user: function(userId, callback){
      return req({url: 'users/' + userId + '/media/recent/'});
    },
    tag: function(tag, callback) {
      return req({url: 'tags/' + tag + '/media/recent/'});
    },
    // auth: auth,
  }

}]);

app.controller('MainCtrl', function ($scope, instagram, $http, $filter, Serial){
  $scope.money = 1000;
  $scope.layout = 'grid';
  $scope.setLayout = function (l) {
    $scope.layout = l;
  }
  $scope.content = 'classy';
  $scope.search = search;
  $scope.$watch('content', search);
  $scope.showUser = function (user) {
    $scope.user = user.username;
    $scope.userPics = instagram.user(user.id);
  }
  $scope.clear = function () {
    if($scope.photo)
      return $scope.photo = null;
    $scope.user = null;
  }
  $scope.showImage = function (photo) {
    $scope.photo = photo;
  }
  function search (content) {
    if(content.length < 3)
      return;
    $scope.user = null;
    $scope.users = instagram.searchUsers(content);
    $scope.tagPics = instagram.tag(content);
    $scope.tag = content;
  }
  $scope.$on('money:get', function (e, value) {
    $scope.$apply(function(){
      $scope.money += value;
    });
  });
  $scope.printImage = function (photo) {
    $scope.printing = true;
    // window.print()
    popupPrint(photo.images.standard_resolution.url, function () {
      $scope.$apply(function(){
        $scope.printing = false;
        $scope.money -= 100;
        $scope.clear();
      });
    });
  }
});

function loadImage (uri, el, callback) {
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = function () {
    var ourl = window.URL.createObjectURL(xhr.response)
    el.src = ourl;
    callback && callback(el, ourl);
  };
  xhr.open('GET', uri, true);
  xhr.send();
}

function popupPrint (uri, callback) {
  var popup = chrome.app.window.get('print');
  var $popDoc = popup.contentWindow.document;
  var $img = $popDoc.createElement('img');
  $popDoc.body.innerHTML = '';
  loadImage(uri, $img, function () {
    $popDoc.body.appendChild($img);
    setTimeout(function(){
      popup.contentWindow.print();
      callback && callback();
    }, 200)
  });
}

app.directive('remoteSrc', function(){
  return {
    restrict: 'A',
    link: function(scope, el, attrs) {
      loadImage(attrs.remoteSrc, el[0], function () {
        setTimeout(function(){
          el.addClass('loaded');
        }, 100);
      });
    }
  }
});

app.directive('setBounds', function () {
  return {
    restrict: 'A',
    scope: {
      photo: '='
    },
    link: function ($scope, $el, $attrs) {
      // $scope.$watch('photo', function () {
        var el = $el[0];
        var parent = el.parentNode;
        var w = Math.min(640, parent.offsetWidth);
        var h = Math.min(640, parent.offsetHeight);
        var bound = Math.min(w, h);
        el.style.width = el.style.height = bound + 'px';
        el.style.marginTop = (parent.offsetHeight - bound) / 2 + 'px';
      // });
    }
  }
});

app.service('Serial', function($rootScope) {
  var DEVICE = false;
  var DEVICE_PATH = '';

  chrome.storage.onChanged.addListener(function(changes, namespace){
    if(changes.devicePath)
      DEVICE_PATH = changes.devicePath.newValue;
  });

  chrome.storage.local.get({
    devicePath: DEVICE_PATH
  }, function(items){
    DEVICE_PATH = items.devicePath;
  });

  function connect () {
    log('searching for device.. "' + DEVICE_PATH + '"');
    connection.getDevices(function(items){
      if(!items.some(function(item){
          return item.path === DEVICE_PATH;
          }))
        return (DEVICE = false || log('searching for device.. NOT FOUND'));
      DEVICE = connection.connect();
    });
  }

  (function polling () {
    if(!DEVICE_PATH) {}
    else if(!(DEVICE && log('ping..') && connection.send(ba_reply['status'])) && log('..pong')) {
      log('..no answer');
      connect();
    }
    setTimeout(polling, 5000);
  }());

  window.checkReply = function checkReply(code){
    if (code in ba_errorcodes){
      log('Error: ' + ba_errorcodes[code]);
    }
    else if (code in ba_roubles){
      log('Got: ' + ba_roubles[code] + ' roubles');
      $rootScope.$broadcast('money:get', ba_roubles[code]);
      log('adding money');
      //addFunds(ba_roubles[code]);
      //log('try to get money');
      //getFunds();
      log('check for reply: ' + ba_reply['recieved_bootup_message']);
      log('accept payment reply');

      connection.send(ba_reply['recieved_bootup_message']);
      //sendReply(ba_reply['status']);
      addFunds(ba_roubles[code]);
      log('afterAdd: ' + getFunds());
    }
    else if (code in ba_firstline){
      log('other: ' + ba_firstline[code]);
    }
    else if (code in ba_sl){
      log('Booting: ' + ba_sl[code]);    
      log('checking for reply: ' + ba_reply['recieved_bootup_message']);
      log('boot reply');
      connection.send(ba_reply['recieved_bootup_message']);
      //sendReply(ba_reply['recieved_bootup_message']);
    }
    else {
      log('Fucking something: ' + code);
    }
  }
});