define([
  'jquery',
  'underscore',
  'backbone',
  "collections/blocks",
  "collections/templates",
  "models/site",
  "views/block_insert",
  "views/layout",
  "views/site",
  "views/template_select",
  "jquerypp/event/drag"
  ], function($, _, Backbone,
              BlocksCollection, TemplatesCollection, Site,
              BlockInsertView, LayoutView, SiteView, TemplateSelectView) {

  var EditorView = Backbone.View.extend({
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
        <div class='x-handle'>&Dagger;</div>\
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
      var blocks = new BlocksCollection([
        {
            id: "header_image"
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
            id: "search_form"
          , name: "Search Form"
          , filename: "searchform.html"
        }
        , {
            id: "sidebar"
          , name: "Sidebar"
          , filename: "sidebar.html"
        }
      ]);

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

      new BlockInsertView({collection: blocks});

      new SiteView({
          model: new Site
        , collection: blocks
      });

      new LayoutView;
    }
  });

  return EditorView;
});
