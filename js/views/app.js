define([
  'jquery',
  'underscore',
  'backbone',
  "jquerypp/event/drag"
  ], function($, _, Backbone, Menu, MenuItem) {

  var AppView = Backbone.View.extend({
    el: $("body")

    // All the view initialize functions are in the order:
    // prepare DOM -> listen to events -> load data
    , initialize: function() {
      this.currentTemplate = window.document.URL.split("/").pop();

      this.loadEditor();
      this.loadViews();
    }

    , loadEditor: function () {
      this.$el[0].innerHTML += "<div id='x-layout-editor'>\
        <div class='x-handle'></div>\
        <form>\
          <h4><label>Current Template</label></h4>\
          <div id='x-templates-list'></div>\
        </form>\
      </div>";

      $(window.document).on({
        draginit: function (e, drag) {
          var mouse = drag.mouseElementPosition;

          drag.representative($(drag.element).parent(), mouse.left(), mouse.top()).only();
        }

        , dragmove: function (e, drag) {
          $(drag.element).parent().css("zIndex", 9999);
        }
      }, "#x-layout-editor .x-handle");
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
          , currentTemplate: this.currentTemplate
        });
      }, this));

      require([
        "collections/blocks",
        "views/block_insert"
      ], function (BlocksCollection, BlockInsertView) {

        var blocks = new BlocksCollection([
          {
              id: "headerimage"
            , name: "Header Image"
            , filename: "headerimage.html"
          }
          , {
              id: "menu"
            , name: "Menu"
            , filename: "menu.html"
          }
          , {
              id: "content"
            , name: "Content"
            , filename: "page.html"
          }
          , {
              id: "searchform"
            , name: "Search Form"
            , filename: "searchform.html"
          }
          , {
              id: "sidebar"
            , name: "Sidebar"
            , filename: "sidebar.html"
          }
        ]);

        new BlockInsertView({collection: blocks});
      });

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
