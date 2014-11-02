'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var MessageItemView = require('./MessageItemView');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div><p>Loading messages...</p></div>')
});

module.exports = Marionette.CompositeView.extend({
  childView: MessageItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: _.template('<div></div>')
});
