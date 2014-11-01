'use strict';

var _ = require('underscore');
var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/collab_groups_list_item.hbs');

module.exports = Marionette.LayoutView.extend({
  tagName: 'div',
  className: 'nm-groups-list-item col-md-4',
  template: template,
  events: {
    'click .js-nm-groups-delete': 'deleteGroup'
  },
  onShow: function () {  
    
  },
  deleteGroup: function (e) {
    e.preventDefault();
    e.stopPropagation();
    var groupsListCollection = this.model.collection;
    groupsListCollection.remove(this.model);
    groupsListCollection.trigger('change');
    // var friendsListData = _.pick(_.pluck(friendsListCollection.models, 'attributes'), 'name', 'queryString', 'selected', 'semester');
    // localforage.setItem('timetable:friends', friendsListData);
  }
});
