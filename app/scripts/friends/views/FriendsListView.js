'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var FriendsListItemView = require('./FriendsListItemView');
var template = require('../templates/friends_list_empty.hbs');

var EmptyView = Marionette.ItemView.extend({
  template: template
});

module.exports = Marionette.CollectionView.extend({
  tagName: 'tbody',
  childView: FriendsListItemView,
  emptyView: EmptyView
});
