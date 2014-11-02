'use strict';

var _ = require('underscore');
var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/collab_message_item.hbs');

module.exports = Marionette.LayoutView.extend({
  tagName: 'div',
  template: template,
  
  onShow: function () {  
    
  },
  deleteGroup: function (e) {
  }
});
