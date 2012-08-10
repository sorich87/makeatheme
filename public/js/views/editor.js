define([
  'jquery',
  'underscore',
  'backbone',
  "collections/regions",
  "collections/blocks",
  "collections/templates",
  "models/site",
  "views/block_insert",
  "views/layout",
  "views/site",
  "views/template_select",
  "jquerypp/event/drag"
  ], function($, _, Backbone,
              RegionsCollection, BlocksCollection, TemplatesCollection, Site,
              BlockInsertView, LayoutView, SiteView, TemplateSelectView) {

  var EditorView = Backbone.View.extend({
    el: $("body")

    , initialize: function () {
      this.currentTemplate = window.document.URL.split("/").pop();
    }

    // Call parent window require function to get data and load editor and views
    , render: function () {
      window.parent.require(["init"], $.proxy(function (init) {
        this.themeData = init;

        this.loadEditor();
        this.loadViews();
      }, this));
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
      var regions = new RegionsCollection(this.themeData.regions)
        , blocks = new BlocksCollection(this.themeData.blocks)
        , templates = new TemplatesCollection(this.themeData.templates);

      new TemplateSelectView({
          collection: templates
        , currentTemplate: this.currentTemplate
      });

      new BlockInsertView({collection: blocks});

      new SiteView({
          model: new Site
        , regions: regions.models
        , blocks: blocks.models
      });

      new LayoutView;
    }
  });

  return EditorView;
});
