'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var navigationItem = App.request('addNavigationItem', {
  name: 'NUStyle',
  icon: 'tags',
  url: '/nustyle'
});

var controller = {
  showBareNus: function () {
    var BareNusView = require('./views/BareNusView');
    navigationItem.select();
    App.mainRegion.show(new BareNusView());
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'nustyle': 'showBareNus'
    }
  });
});

