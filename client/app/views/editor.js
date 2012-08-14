var app = require("application")
  , View = require("views/base/view")
  , BlockInsertView = require("views/block_insert")
  , LayoutView = require("views/layout")
  , SiteView = require("views/site")
  , StyleEditView = require("views/style_edit")
  , TemplateSelectView = require("views/template_select");

module.exports = View.extend({
  el: $("<div id='x-layout-editor'>\
      <div class='x-handle'>&Dagger;</div>\
      </div>")

  , initialize: function () {
    this.draggableEditor();
    this.draggableColumns();
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
  , render: function() {
    this.$el

      // Append template select view
      .append(new TemplateSelectView({
        collection: app.templates
      }).render().$el)

      // Append block insertion view
      .append(new BlockInsertView({
        collection: app.blocks
      }).render().$el)

      // Append CSS editor view
      .append(new StyleEditView({
        collection: app.styles
      }).render().$el)

      // Append result to body element
      .appendTo(new SiteView({
          model: app.site
        , regions: app.regions.models
        , blocks: app.blocks.models
      }).render().$el);
  }

  , draggableColumns: function () {
    new LayoutView;
  }
});
