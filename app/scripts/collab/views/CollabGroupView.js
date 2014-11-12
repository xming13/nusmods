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
var FriendsView = require('../../friends/views/FriendsView');
var VenueAvailabilityView = require('./VenueAvailabilityView');

var NUSMods = require('../../nusmods');
var config = require('../../common/config');
var timify = require('../../common/utils/timify');

var loadVenueInformation = function (callback) {

  // List of venues ['LT17', 'BIZ2-0118', 'COM1-0114', ...]
  var venuesList = [];
  var venues = {};

  NUSMods.getAllTimetable(config.semester).then(function (data) {
    // Make a deepcopy so modifications will not affect the cached timetable data
    var timetables = jQuery.extend(true, {}, data); 

    _.each(timetables, function (module) {
      if (module.Timetable) {
        _.each(module.Timetable, function (lesson) {
          var currentVenue = lesson.Venue;
          if (!venues[currentVenue]) {
            venues[currentVenue] = [];
          }
          lesson.ModuleCode = module.ModuleCode;
          delete lesson.Venue;
          venues[currentVenue].push(lesson);
        });
      }
    });

    venues = _.omit(venues, ''); // Delete empty venue string
    
    venuesList = _.keys(venues);
    _.each(venuesList, function (venueName) {
      var venueTimetable = venues[venueName];
      var newVenueTimetable = [];
      var days = timify.getSchoolDays();
      _.each(days, function (day) {
        var lessons = _.filter(venueTimetable, function (lesson) {
          return lesson.DayText === day;
        });
        lessons = _.sortBy(lessons, function (lesson) {
          return lesson.StartTime + lesson.EndTime;
        });

        var timeRange = _.range(timify.convertTimeToIndex('0800'), 
                                timify.convertTimeToIndex('2400'));
        var availability = _.object(_.map(timeRange, function (index) {
          return [timify.convertIndexToTime(index), 'vacant'];
        }));

        _.each(lessons, function (lesson) {
          var startIndex = timify.convertTimeToIndex(lesson.StartTime);
          var endIndex = timify.convertTimeToIndex(lesson.EndTime) - 1;
          for (var i = startIndex; i <= endIndex; i++) {
            availability[timify.convertIndexToTime(i)] = 'occupied';
          }
        });

        // availability: {
        //    "0800": "vacant",
        //    "0830": "vacant",
        //    "0900": "occupied",
        //    "0930": "occupied",
        //    ...
        //    "2330": "vacant"
        // }

        newVenueTimetable.push({
          day: day,
          lessons: lessons,
          availability: availability,
          shortDay: day.slice(0, 3)
        });
      });
      venues[venueName] = newVenueTimetable;
    });
    venuesList.sort();
    callback(venues, venuesList);
  });
};

module.exports = Marionette.LayoutView.extend({
  initialize: function () {

  },
  template: template,
  regions: {
    meetingDetailsRegion: '.nm-collab-meeting-details',
    messagesRegion: '.nm-collab-message-content',
    friendsRegion: '.nm-collab-friends-container',
    venuesRegion: '.nm-collab-venues-container'
  },
  ui: {
    
  },
  events: {
    'keypress input[type=text]': 'enterMessage'
  },
  onShow: function () {
    var that = this;
    var group = this.model.get('group');
    var messagesRef = new Firebase('https://nusmods-collab.firebaseio.com/messages/' + group.slug);
    this.messagesRef = messagesRef;
    var messagesQuery = messagesRef.limit(10);

    this.messagesCollection = new Backbone.Collection([]);

    function scrollToBottom() {
      $('.nm-collab-message-content-container').animate({ scrollTop: 999999 }, 'slow');
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

    localforage.getItem('timetable:friends').then(function (friendsList) {
      that.friendsRegion.show(new FriendsView({
        collection: that.model.get('groupMembers')
      }));
    });
    that.listenTo(that.meetingDetailsView, 'openVenueSelectionModal', function (venue) {
      that.showVenues();
    });
  },
  enterMessage: function (e) {
    if (e.which === 13) {
      var $inputBox = $('.js-nm-collab-input-message');
      var msg = $inputBox.val();

      var obj = {
        fbid: FB.getUserID(),
        message: msg,
        name: user.getName()
      };
      if (!obj.name) {
        obj.name = 'Tay Yang Shun';
      }
      this.messagesRef.push(obj, function () {
        $inputBox.val('');
      });
    }
  },
  showVenues: function () {
    var that = this;
    loadVenueInformation(function (venues, venuesList) {
      var venuesModel = new Backbone.Model({
        venues: venues,
        venuesList: venuesList
      });
      that.venueAvailabilityView = new VenueAvailabilityView({model: venuesModel});
      that.venuesRegion.show(that.venueAvailabilityView);

      that.listenTo(that.venueAvailabilityView, 'venueClicked', function (venue) {
        $('#venues-modal').modal('hide');
        that.meetingDetailsView.updateMeetingVenue(venue);
      });
    });
  }
});
