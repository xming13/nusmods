'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var localforage = require('localforage');
var template = require('../templates/collab_group.hbs');
var MessageView = require('./MessageView');
var user = require('../../common/utils/user');

module.exports = Marionette.LayoutView.extend({
  initialize: function () {

  },
  template: template,
  regions: {
    meetingDetailsRegion: '.nm-collab-meeting-details',
    messagesRegion: '.nm-collab-message-content'
  },
  ui: {
    
  },
  events: {
    'keypress input[type=text]': 'enterMessage',
  },
  onShow: function () {
    var that = this;
    var group = this.model.get('group');
    var messagesRef = new Firebase('https://nusmods-collab.firebaseio.com/messages/' + group.slug);
    this.messagesRef = messagesRef;
    var messagesQuery = messagesRef.limit(10);

    this.messagesCollection = new Backbone.Collection([]);

    function scrollToBottom() {
      $('.nm-collab-message-content-container').animate({ scrollTop: 999999 }, "slow");
    }
    messagesQuery.on('child_added', function (snapshot) {
      var data = snapshot.val();
      that.messagesCollection.add(data);
      that.messageView.render();
      scrollToBottom();
    }, function (errorObject) {
      console.log('The read failed: ' + errorObject.code);
    });
    this.messageView = new MessageView({
      collection: this.messagesCollection
    });
    that.messagesRegion.show(this.messageView);

    var CollabMeetingDetailsView = require('./CollabMeetingDetailsView');
    var groupModel = new Backbone.Model({
      group: group
    })
    this.meetingDetailsView = new CollabMeetingDetailsView({
      model: groupModel
    });
    this.meetingDetailsRegion.show(this.meetingDetailsView);
  },
  enterMessage: function (e) {
    if (e.which === 13) {
      var $inputBox = $('.js-nm-collab-input-message');
      var msg = $inputBox .val();

      var obj = {
        fbid: FB.getUserID(),
        message: msg,
        name: user.getName()
      };

      this.messagesRef.push(obj, function () {
        $inputBox.val('');
      });
    }
  }
});
