'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var GroupsListItemView = require('./GroupsListItemView');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div><p>No friends added.</p></div>')
});

module.exports = Marionette.CompositeView.extend({
  childView: GroupsListItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: _.template('<div class="row"></div>')
});
