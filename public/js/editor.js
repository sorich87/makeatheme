define([
  "jquery",
  "underscore",
  "backbone",
  "views/block_insert",
  "views/layout",
  "views/site",
  "views/template_select",
  "jquerypp/event/drag"
], function ($, _, Backbone,
              BlockInsertView, LayoutView, SiteView, TemplateSelectView) {

  var EditorView = Backbone.View.extend({
    el: $("body")

    , initialize: function () {
      this.draggableEditor();
    }

    // Call parent window require function to get data and load views
    , render: function () {
      window.parent.require(["init"], $.proxy(function (init) {
        this.themeData = init;

        this.loadViews();
      }, this));
    }

    , draggableEditor: function () {
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
      // Setup editor box
      $("<div id='x-layout-editor'>\
        <div class='x-handle'>&Dagger;</div>\
        </div>")
      // Append template select view
        .append(new TemplateSelectView({
          collection: this.themeData.templates
        }).$el)
      // Append block insertion view
        .append(new BlockInsertView({collection: this.themeData.blocks}).$el)
      // Append result to body element
        .appendTo(this.$el);

      new SiteView({
          model: this.themeData.site
        , regions: this.themeData.regions.models
        , blocks: this.themeData.blocks.models
      });

      new LayoutView;
    }
  });

  (new EditorView).render();
});
