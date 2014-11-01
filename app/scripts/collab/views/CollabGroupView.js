'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var localforage = require('localforage');

var template = require('../templates/collab_group.hbs');

require('bootstrap/tooltip');
require('bootstrap/popover');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {

  },
  template: template,
  regions: {
  },
  ui: {
    
  },
  onShow: function () {
    var that = this;
    
  }
});
