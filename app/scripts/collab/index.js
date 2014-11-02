'use strict';

var App = require('../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var localforage = require('localforage');

var navigationItem = App.request('addNavigationItem', {
  name: 'Collab',
  icon: 'users',
  url: '/collab'
});

function init () {
  var groupsList = [
    {
      name: 'CS3240 Project',
      slug: 'cs3240-project',
      members: [
        {fbid: '558978353'},
        {fbid: '631573134' },
        {fbid: '675532440'},
        {fbid: '100001166373215'}
      ]
    },
    {
      name: 'CS4243 Project',
      slug: 'cs4243-project',
      members: [
        {fbid: '558978353'},
        {fbid: '550789610'},
        {fbid: '100000005101505'},
        {fbid: '1711521631'}
      ]
    },
    {
      name: 'CS4249 Assignment',
      slug: 'cs4249-assignment',
      members: [
        {fbid: '558978353'},
        {fbid: '1711521631'}
      ]
    }
  ];
  localforage.setItem('groups:list', groupsList);
  return groupsList;
}

var controller = {
  showGroups: function () {
    var CollabGroupsView = require('./views/CollabGroupsView');
    navigationItem.select();
    localforage.getItem('groups:list').then(function (groupsList) {
      if (!groupsList) {
        groupsList = init();
      }
      localforage.getItem('timetable:friends').then(function (friendsList) {
        _.each(groupsList, function (group) {
          group.members = _.map(group.members, function (member) {
            var member = _.findWhere(friendsList, {fbid: member.fbid});
            return member;
          });
        });
        App.mainRegion.show(new CollabGroupsView(groupsList));
      });
    });
  },
  showGroup: function (slug) {
    var CollabGroupView = require('./views/CollabGroupView');
    navigationItem.select();
    localforage.getItem('groups:list').then(function (groupsList) {
      if (!groupsList) {
        groupsList = init();
      }
      var group = _.findWhere(groupsList, {slug: slug});
      localforage.getItem('timetable:friends').then(function (friendsList) {
        group.members = _.map(group.members, function (member) {
          var member = _.findWhere(friendsList, {fbid: member.fbid});
          return member;
        });
        var groupModel = new Backbone.Model({
          group: group,
        });
        App.mainRegion.show(new CollabGroupView({model: groupModel}));  
      });
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
