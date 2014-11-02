'use strict';

var config = require('../config');
var localforage = require('localforage');

var userName = '';

window.fbAsyncInit = function() {
  FB.init({
    appId      : config.facebookAppID,
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.1' // use version 2.1
  });
  module.exports.getFacebookLoginStatus();
};

module.exports = {
  initialize: function (callback) {
    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    if (callback) {
      callback();
    }
  },
  getFacebookLoginStatus: function (callback) {
    var that = this;
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        localforage.getItem('user:fb:name', function (name) {
          var facebookId = FB.getUserID();
          if (name) {
            FB.api('/me', function (response) {
              var name = response.name;
              userName = name;
              localforage.setItem('user:fb:name', name);
              localforage.setItem('user:fb:id', facebookId);
              if (callback) {
                callback({
                  loggedIn: true, 
                  name: response.name,
                  facebookId: facebookId
                });
              }
            });
          } else {
            userName = name;
            console.log(that.name)
            callback({
              loggedIn: true, 
              name: name,
              facebookId: facebookId
            });
          }
        });
      } else {
        callback({loggedIn: false});
      }
    });
  },
  toggleFacebookLogin: function (callback) {
    var that = this;
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
            FB.api('/me', function (response) {
              var name = response.name;
              userName = name;
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
  getName: function (callback) {
    console.log('getName', userName);
    if (userName) {
      return userName;
    }
    if (!callback) {
      return;
    }
    localforage.getItem('user:fb:name', function (data) {
      callback(data);
    });
  }
}
