'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/collab_group_meeting_details.hbs');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {
    
  },
  template: template,
  events: {
    'blur [contenteditable]': 'updateMeetingDetails',
    'keydown [contenteditable]': 'updateMeetingDetailsEnter',
  },
  onShow: function () {
    var that = this;
    var group = this.model.get('group');

    var detailsRef = new Firebase('https://nusmods-collab.firebaseio.com/groups/' + group.slug + '/meeting');
    this.detailsRef = detailsRef;
    var notFired = true;
    detailsRef.on('value', function (snapshot) {
      var data = snapshot.val();
      that.model.set('date', data.date);
      that.model.set('time', data.time);
      that.model.set('venue', data.venue);
      if (notFired) {
        notFired = false;
      } else {
        alert('Meeting timing has been changed!');
      }
      that.render();
    }, function (errorObject) {
      console.log('The read failed: ' + errorObject.code);
    });
  },
  updateMeetingDetailsEnter: function (e) {
    if (e.which === 13) {
      this.updateMeetingDetails();
    }
  },
  updateMeetingDetails: function () {
    console.log('updateMeetingDetails');

    this.detailsRef.child('date').set($('.nm-collab-meeting-details-date').html());
    this.detailsRef.child('time').set($('.nm-collab-meeting-details-time').html());
    this.detailsRef.child('venue').set($('.nm-collab-meeting-details-venue').html());
  }
});
