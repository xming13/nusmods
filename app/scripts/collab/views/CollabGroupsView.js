'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var localforage = require('localforage');

var template = require('../templates/collab_groups.hbs');
var GroupsListView = require('./GroupsListView');

require('bootstrap/tooltip');
require('bootstrap/popover');

module.exports = Marionette.LayoutView.extend({
  initialize: function (data) {
    this.dataRaw = data;
  },
  template: template,
  regions: {
    groupsListRegion: '.nm-groups-list'
  },
  ui: {
    
  },
  onShow: function () {
    var that = this;
    that.groupsListCollection = new Backbone.Collection(this.dataRaw);
    that.groupsListView = new GroupsListView({collection: that.groupsListCollection});
    that.groupsListRegion.show(that.groupsListView);
    that.groupsListCollection.on('change', function () {
      that.groupsListView.render();
    });
  }
});
