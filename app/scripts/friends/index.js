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

function init () {
  var friendsList = [
    {
      name: 'Tay Yang Shun',
      fbid: '558978353',
      queryString: 'CS4243[LEC]=1&CS4243[LAB]=2&CS3240[LEC]=1&CS3240[TUT]=1&CS3240[LAB]=2&CS4249[LEC]=1&CP4101=&CS1010S[LEC]=1&CS1010S[REC]=5&CS1010S[TUT]=18&CS3216[LEC]=1&CS3216[TUT]=1&CS3246[LAB]=2&CS3246[LEC]=1&CS3246[TUT]=2',
      semester: 1,
      selected: false
    },
    {
      name: 'Darren Chua',
      fbid: '631573134',
      queryString: 'HR2002[LEC]=E4&HR2002[TUT]=E21&CS5351[LEC]=1&CG3207[LAB]=B1&CG3207[LEC]=1&CS3240[LEC]=1&CS3240[TUT]=1&CS3240[LAB]=2',
      semester: 1,
      selected: false
    },
    {
      name: 'Shana Nietono',
      fbid: '100001166373215',
      queryString: 'CS3283[LEC]=1&CS3240[TUT]=1&CS3240[LEC]=1&CS3240[LAB]=2&NM4225[SEM]=1&LAK2201[TUT]=T4&LAK2201[LEC]=1&NM4227[SEM]=1',
      semester: 1,
      selected: false
    },
    {
      name: 'Khor PooSiang',
      fbid: '675532440',
      queryString: 'CG3002[LEC]=1&CG3002[LAB]=B2&EG2401[LEC]=1&EG2401[TUT]=114&EE3131C[PLEC]=1&EE3131C[PTUT]=1&CS3240[LEC]=1&CS3240[TUT]=1&CS3240[LAB]=1&GEM2027[LEC]=1&GEM2027[TUT]=W13&NCC1000[TUT]=19',
      semester: 1,
      selected: false
    },
    {
      name: 'Le Minh Tu',
      fbid: '100000005101505',
      queryString: 'CS4212[LEC]=1&CS3230[LEC]=1&CS3230[TUT]=7&GEK1067[LEC]=1&GEK1067[TUT]=W8&IS1103FC[SEC]=2&CS4243[LEC]=1&CS4243[LAB]=4&PC3274[LEC]=SL1&PC3274[TUT]=ST1&CS1010S[LEC]=1&CS1010S[REC]=5&CS1010S[TUT]=12',
      semester: 1,
      selected: false
    },
    {
      name: 'Nguyen Trung Hieu',
      fbid: '1711521631',
      queryString: 'CS1010S[LEC]=1&CS1010S[TUT]=4&CS1010S[REC]=1&CP4101=&MA2214[LEC]=SL1&MA2214[TUT]=T05&PC1141[LEC]=SL1&PC1141[LAB]=WA1&PC1141[TUT]=T6A&SSA1203[LEC]=1&SSA1203[TUT]=E6',
      semester: 1,
      selected: false
    },
    {
      name: 'Jenna Tay Xiu Li',
      fbid: '550789610',
      queryString: 'IS2101[SEC]=1&BT2101[LEC]=1&BT2101[TUT]=2&ST2131[LEC]=SL1&ST2131[TUT]=T04&MA1101R[LEC]=SL1&MA1101R[TUT]=T11&MA1101R[LAB]=B07&GEM2901[LEC]=SL1',
      semester: 1,
      selected: false
    }
  ];
  localforage.setItem('timetable:friends', friendsList);
  return friendsList;
}

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
