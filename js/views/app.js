define([
  'jquery',
  'underscore',
  'backbone',
  ], function($, _, Backbone, Menu, MenuItem) {

  var AppView = Backbone.View.extend({
    // All the view initialize functions are in the order:
    // prepare DOM -> listen to events -> load data
    initialize: function() {
      this.templatePath = "theme/";
      this.currentTemplate = window.document.URL.split("/").pop();

      this.loadViews();
    }

    // Load views
    , loadViews: function() {
      require([
        "collections/templates",
        "views/template_select"
      ], $.proxy(function (TemplatesCollection, TemplateSelectView) {

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

        new TemplateSelectView({
            collection: templates
          , templatePath: this.templatePath
          , currentTemplate: this.currentTemplate
        });
      }, this));

      require(["models/site", "views/site"], function (Site, SiteView) {
        new SiteView({model: new Site});
      });

      require(["views/layout"], function (LayoutView) {
        new LayoutView();
      });
    }
  });

  return AppView;
});
