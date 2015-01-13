'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Marionette = require('backbone.marionette');
var template = require('../templates/friends_list_item.hbs');
var editFriendTimetableModalTemplate = require('../templates/friend_edit_modal.hbs');
var localforage = require('localforage');

module.exports = Marionette.ItemView.extend({
  tagName: 'tr',
  className: 'media nm-friends-list-item',
  template: template,
  events: {
    'click .nm-friends-name': 'selectFriend',
    'click .js-nm-friends-save': 'saveFriendTimetable',
    'click .js-nm-friends-delete': 'deleteFriendTimetable',
    'change .js-nm-friends-select-checkbox': 'toggleFriendSelection'
  },
  onShow: function () {
    var _this = this;
    this.$el.find('.js-nm-friends-edit').popover({
      html: true,
      placement: 'bottom',
      content: editFriendTimetableModalTemplate(_this.model.attributes)
    });
    $('[data-toggle="popover"]').on('click', function (e) {
      $('[data-toggle="popover"]').not(this).popover('hide');
    });
  },
  onBeforeDestroy: function () {
    $('[data-toggle="popover"]').popover('hide');
  },
  selectFriend: function () {
    _.each(this.model.collection.models, function (model) {
      model.set('selected', false);
    });
    this.model.set('selected', true);
  },
  toggleFriendSelection: function (e) {
    e.preventDefault();
    e.stopPropagation();
    var selected = this.model.get('selected');
    this.model.set('selected', !selected);
  },
  saveFriendTimetable: function (e) {
    console.log(this);
    var friendName = $('#name').val();
    var originalUrl = $('#url').val();
    this.model.set({
      name: friendName,
      url: originalUrl,
    });
    $('[data-toggle="popover"]').popover('hide');
    this.model.collection.trigger('edit', this.model);
  },
  deleteFriendTimetable: function (e) {
    e.preventDefault();
    e.stopPropagation();
    var choice = window.confirm('Do you really want to delete ' + this.model.get('name') + '\'s timetable?');
    if (choice) {
      var friendsListCollection = this.model.collection;
      friendsListCollection.remove(this.model);
      friendsListCollection.trigger('change');
      friendsListCollection.trigger('save');
    }
  }
});
