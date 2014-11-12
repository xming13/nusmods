'use strict';

var App = require('../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var FriendModel = require('./models/FriendModel');
var _ = require('underscore');

var navigationItem = App.request('addNavigationItem', {
  name: 'Friends',
  icon: 'user',
  url: '/friends'
});

var controller = {
  showFriends: function () {
    localforage.getItem('timetable:friends').then(function (friendsList) {
      if (!friendsList) {
        friendsList = init();
      }
      var FriendsView = require('./views/FriendsView');
      navigationItem.select();

      var friendsModel = _.map(friendsList, function (friend) {
        return new FriendModel(friend);
      });
      var friendsListCollection = new Backbone.Collection(friendsModel);
      App.mainRegion.show(new FriendsView({
        collection: friendsListCollection
      }));
    });
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'friends': 'showFriends'
    }
  });
});
