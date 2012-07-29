define([
  'jquery',
  'underscore',
  'backbone',
  'collections/menu',
  'models/menu_item'
  ], function($, _, Backbone, Menu, MenuItem) {

  var AppView = Backbone.View.extend({
      el: $(window.parent.document)

    // All the view initialize functions are in the order:
    // prepare DOM -> listen to events -> load data
    , initialize: function() {
      this.loadWidgets();
    }

    // Load widgets
    , loadWidgets: function() {
      require(["models/site", "views/site"], function (Site, SiteView) {
        new SiteView({model: new Site});
      });

      require(["models/page", "views/page"], function (Page, PageView) {
        new PageView({model: new Page});
      });

      require(["views/menu"], function (MenuView) {
        new MenuView();
      });

      require(["views/layout"], function (LayoutView) {
        new LayoutView();
      });
    }
  });

  return AppView;
});
