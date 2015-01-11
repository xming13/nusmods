'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var FriendsListItemView = require('./FriendsListItemView');

module.exports = Marionette.CollectionView.extend({
  tagName: 'tbody',
  childView: FriendsListItemView
});
