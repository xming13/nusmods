'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var NUSMods = require('./nusmods');
var NavigationCollection = require('./common/collections/NavigationCollection');
var NavigationView = require('./common/views/NavigationView');
var Promise = require('bluebird'); // jshint ignore:line
var SelectedModulesController = require('./common/controllers/SelectedModulesController');
var TimetableModuleCollection = require('./common/collections/TimetableModuleCollection');
var _ = require('underscore');
var config = require('./common/config');
var localforage = require('localforage');
var $ = require('jquery');
var user = require('./common/utils/user');
require('qTip2');

// Set Backbone.History.initialRoute to allow route handlers to find out if they
// were called from the initial route.
var loadUrl = Backbone.History.prototype.loadUrl;
Backbone.History.prototype.loadUrl = function() {
  if (!Backbone.History.initialRoute) {
    Backbone.History.initialRoute = true;
  } else {
    Backbone.History.initialRoute = false;
    // No longer initial route, restore original loadUrl.
    Backbone.History.prototype.loadUrl = loadUrl;
  }
  return loadUrl.apply(this, arguments);
};

var App = new Marionette.Application();

App.addRegions({
  mainRegion: '.content',
  navigationRegion: '#nav',
  selectRegion: '.navbar-form',
  bookmarksRegion: '.nm-bookmarks'
});

var navigationCollection = new NavigationCollection();
var navigationView = new NavigationView({collection: navigationCollection});
App.navigationRegion.show(navigationView);

App.reqres.setHandler('addNavigationItem', function (navigationItem) {
  return navigationCollection.add(navigationItem);
});

NUSMods.setConfig(config);

var selectedModulesControllers = [];

for (var i = 0; i < 5; i++) {
  selectedModulesControllers[i] = new SelectedModulesController({
    semester: i + 1
  });
}

App.reqres.setHandler('selectedModules', function (sem) {
  return selectedModulesControllers[sem - 1].selectedModules;
});
App.reqres.setHandler('addModule', function (sem, id, options) {
  return selectedModulesControllers[sem - 1].selectedModules.add({
    ModuleCode: id,
    Semester: sem
  }, options);
});
App.reqres.setHandler('removeModule', function (sem, id) {
  var selectedModules = selectedModulesControllers[sem - 1].selectedModules;
  return selectedModules.remove(selectedModules.get(id));
});
App.reqres.setHandler('isModuleSelected', function (sem, id) {
  return !!selectedModulesControllers[sem - 1].selectedModules.get(id);
});
App.reqres.setHandler('displayLessons', function (sem, id, display) {
  _.each(selectedModulesControllers[sem - 1].timetable.where({
    ModuleCode: id
  }), function (lesson) {
    lesson.set('display', display);
  });
});

var bookmarkedModulesNamespace = config.namespaces.bookmarkedModules + ':';

App.reqres.setHandler('getBookmarks', function (callback) {
  if (!callback) { 
    return; 
  }
  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    callback(modules);
  });
});
App.reqres.setHandler('addBookmark', function (id) {
  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    if (!_.contains(modules, id)) {
      modules.push(id);
    }
    localforage.setItem(bookmarkedModulesNamespace, modules);
  });
});
App.reqres.setHandler('deleteBookmark', function (id) {
  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    var index = modules.indexOf(id);
    if (index > -1) {
      modules.splice(index, 1);
      localforage.setItem(bookmarkedModulesNamespace, modules);
    }
  });
});

user.initialize();


App.on('start', function () {
  var AppView = require('./common/views/AppView');

  new Marionette.AppRouter({
    routes: {
      '*default': function () {
        Backbone.history.navigate('timetable', {trigger: true, replace: true});
      }
    }
  });

  // header modules
  require('./timetable');
  require('./modules');
  // require('ivle');
  require('./friends');
  require('./collab');
  require('./venues');
  require('./nusessities');
  require('./preferences');

  // footer modules
  require('./about');
  require('./help');
  require('./support');

  Promise.all(_.map(_.range(1, 5), function(semester) {
    var semTimetableFragment = config.semTimetableFragment(semester);
    return localforage.getItem(semTimetableFragment + ':queryString')
      .then(function (savedQueryString) {
      if ('/' + semTimetableFragment === window.location.pathname) {
        var queryString = window.location.search.slice(1);
        if (queryString) {
          if (savedQueryString !== queryString) {
            // If initial query string does not match saved query string,
            // timetable is shared.
            App.request('selectedModules', semester).shared = true;
          }
          // If there is a query string for timetable, return so that it will
          // be used instead of saved query string.
          return;
        }
      }
      var selectedModules = TimetableModuleCollection.fromQueryStringToJSON(savedQueryString);
      return Promise.all(_.map(selectedModules, function (module) {
        return App.request('addModule', semester, module.ModuleCode, module);
      }));
    });
  }).concat([NUSMods.generateModuleCodes()])).then(function () {
    new AppView();

    Backbone.history.start({pushState: true});
  });

  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    if (!modules) {
      localforage.setItem(bookmarkedModulesNamespace, []);
    }
  });

  function init () {
    var friendsList = [
      {
        name: 'Tay Yang Shun',
        fbid: '558978353',
        queryString: 'CS4243[LEC]=1&CS4243[LAB]=2&CS3240[LEC]=1&CS3240[TUT]=1&CS3240[LAB]=2&CS4249[LEC]=1&CP4101=&CS1010S[LEC]=1&CS1010S[REC]=5&CS1010S[TUT]=18&CS3216[LEC]=1&CS3216[TUT]=1&CS3246[LAB]=2&CS3246[LEC]=1&CS3246[TUT]=2',
        semester: 1,
        selected: false
      },
      {
        name: 'Darren Chua',
        fbid: '631573134',
        queryString: 'HR2002[LEC]=E4&HR2002[TUT]=E21&CS5351[LEC]=1&CG3207[LAB]=B1&CG3207[LEC]=1&CS3240[LEC]=1&CS3240[TUT]=1&CS3240[LAB]=2',
        semester: 1,
        selected: false
      },
      {
        name: 'Shana Nietono',
        fbid: '100001166373215',
        queryString: 'CS3283[LEC]=1&CS3240[TUT]=1&CS3240[LEC]=1&CS3240[LAB]=2&NM4225[SEM]=1&LAK2201[TUT]=T4&LAK2201[LEC]=1&NM4227[SEM]=1',
        semester: 1,
        selected: false
      },
      {
        name: 'Khor PooSiang',
        fbid: '675532440',
        queryString: 'CG3002[LEC]=1&CG3002[LAB]=B2&EG2401[LEC]=1&EG2401[TUT]=114&EE3131C[PLEC]=1&EE3131C[PTUT]=1&CS3240[LEC]=1&CS3240[TUT]=1&CS3240[LAB]=1&GEM2027[LEC]=1&GEM2027[TUT]=W13&NCC1000[TUT]=19',
        semester: 1,
        selected: false
      },
      {
        name: 'Le Minh Tu',
        fbid: '100000005101505',
        queryString: 'CS4212[LEC]=1&CS3230[LEC]=1&CS3230[TUT]=7&GEK1067[LEC]=1&GEK1067[TUT]=W8&IS1103FC[SEC]=2&CS4243[LEC]=1&CS4243[LAB]=4&PC3274[LEC]=SL1&PC3274[TUT]=ST1&CS1010S[LEC]=1&CS1010S[REC]=5&CS1010S[TUT]=12',
        semester: 1,
        selected: false
      },
      {
        name: 'Nguyen Trung Hieu',
        fbid: '1711521631',
        queryString: 'CS1010S[LEC]=1&CS1010S[TUT]=4&CS1010S[REC]=1&CP4101=&MA2214[LEC]=SL1&MA2214[TUT]=T05&PC1141[LEC]=SL1&PC1141[LAB]=WA1&PC1141[TUT]=T6A&SSA1203[LEC]=1&SSA1203[TUT]=E6',
        semester: 1,
        selected: false
      },
      {
        name: 'Jenna Tay Xiu Li',
        fbid: '550789610',
        queryString: 'IS2101[SEC]=1&BT2101[LEC]=1&BT2101[TUT]=2&ST2131[LEC]=SL1&ST2131[TUT]=T04&MA1101R[LEC]=SL1&MA1101R[TUT]=T11&MA1101R[LAB]=B07&GEM2901[LEC]=SL1',
        semester: 1,
        selected: false
      }
    ];
    localforage.setItem('timetable:friends', friendsList);
    return friendsList;
  }

  localforage.getItem('timetable:friends').then(function (friendsList) {
    if (!friendsList) {
      init();
    }
  });
});

module.exports = App;
