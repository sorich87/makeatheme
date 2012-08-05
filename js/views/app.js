define([
  'jquery',
  'underscore',
  'backbone',
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

      require([
        "collections/templates",
        "views/template_select"
      ], function (TemplatesCollection, TemplateSelectView) {

        var templates = new TemplatesCollection([
          {
              filename: "index.html"
            , name: "Default"
          }
          , {
              filename: "page.html"
            , name: "Page"
          }
        ]);

        new TemplateSelectView({collection: templates});
      });

      require(["views/layout"], function (LayoutView) {
        new LayoutView();
      });
    }
  });

  return AppView;
});
