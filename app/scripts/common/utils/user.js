'use strict';

var config = require('../config');
var localforage = require('localforage');

window.fbAsyncInit = function() {
  FB.init({
    appId      : config.facebookAppID,
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.1' // use version 2.1
  });
};

module.exports = {
  initialize: function () {
    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));    
  },
  getFacebookLoginStatus: function (callback) {
    if (!callback) {
      return;
    }
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        localforage.getItem('user:fb:name', function (name) {
          var facebookId = FB.getUserID();
          callback({
            loggedIn: true, 
            name: name,
            facebookId: facebookId
          });
        });
      } else {
        callback({loggedIn: false});
      }
    });
  },
  toggleFacebookLogin: function (callback) {
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        var logout = confirm('Are you sure you want to log out?');
        if (logout) {
          FB.logout(function (response) {
            localforage.removeItem('user:fb:name');
            localforage.removeItem('user:fb:id');
            callback({loggedIn: false});
          });
        }
      } else {
        FB.login(function (response) {
          if (response.status === 'connected') {
            // Logged into your app and Facebook.
            FB.api('/me', function(response) {
              var name = response.name;
              var facebookId = FB.getUserID();
              localforage.setItem('user:fb:name', name);
              localforage.setItem('user:fb:id', facebookId);
              callback({
                loggedIn: true, 
                name: response.name,
                facebookId: facebookId
              });
            });
          } else {
            callback({loggedIn: false});
          }
        });
      }
    });
  },
  name: function (callback) {
    if (!callback) {
      return;
    }
    localforage.getItem('user:fb:name', function (data) {
      return data;
    });
  }
}
