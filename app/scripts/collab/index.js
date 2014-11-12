'use strict';

var App = require('../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var localforage = require('localforage');
var FriendModel = require('../friends/models/FriendModel');

var navigationItem = App.request('addNavigationItem', {
  name: 'Collab',
  icon: 'users',
  url: '/collab'
});

var controller = {
  showGroups: function () {
    var CollabGroupsView = require('./views/CollabGroupsView');
    navigationItem.select();
    
    var groupsRef = new Firebase('https://nusmods-collab.firebaseio.com/groups/');
    groupsRef.once('value', function (snapshot) {
      var groupsList = _.values(snapshot.val());
      var friendsRef = new Firebase('https://nusmods-collab.firebaseio.com/friends/');
      friendsRef.once('value', function (snapshot) {
        var friendsList = _.values(snapshot.val());
        _.each(groupsList, function (group) {
          group.members = _.values(group.members);
          group.members = _.map(group.members, function (member) {
            var member = _.findWhere(friendsList, {fbid: member.fbid});
            return member;
          });
        });
        App.mainRegion.show(new CollabGroupsView(groupsList));
      });

    }, function (errorObject) {
      console.log('The read failed: ' + errorObject.code);
    });
  },
  showGroup: function (slug) {
    var CollabGroupView = require('./views/CollabGroupView');
    navigationItem.select();

    var groupsRef = new Firebase('https://nusmods-collab.firebaseio.com/groups/');
    groupsRef.once('value', function (snapshot) {
      var groupsList = _.values(snapshot.val());
      var group = _.findWhere(groupsList, {slug: slug});

      var friendsRef = new Firebase('https://nusmods-collab.firebaseio.com/friends/');
      friendsRef.once('value', function (snapshot) {
        var friendsList = _.values(snapshot.val());
        var keys = _.keys(group.members);
        group.members = _.map(keys, function (key) { 
          var member = _.findWhere(friendsList, {fbid: group.members[key].fbid});
          return member;
        });
        var groupMembersModel = _.map(group.members, function (friend) {
          return new FriendModel(friend);
        });
        var groupMembersCollection = new Backbone.Collection(groupMembersModel);
        var groupModel = new Backbone.Model({
          group: group,
          groupMembers: groupMembersCollection
        });
        App.mainRegion.show(new CollabGroupView({model: groupModel}));  
      });
    }, function (errorObject) {
      console.log('The read failed: ' + errorObject.code);
    });
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'collab': 'showGroups',
      'collab(/:slug)': 'showGroup',
    }
  });
});
