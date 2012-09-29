var app = require("application")
  , View = require("views/base/view")
  , data = require("lib/editor_data");

module.exports = View.extend({
  el: $("body")

  , events: {
      "draginit #x-layout-editor .x-handle": "dragInit"
    , "dragmove #x-layout-editor .x-handle": "dragMove"
    , "click a:not(#x-customize-button a)": "stopPropagation"
    , "click #x-customize-button a": "loadEditor"
  }

  , initialize: function () {
    _.extend(app.editor, {
        preview_only: !!app.data.preview_only
      , templates: data.templates
      , regions: data.regions
      , blocks: data.blocks
      , style: data.style
    });
  }

  // Show editor when "template:loaded" event is triggered
  , render: function () {
    var $editor;

    this.$el.append("<div id='x-layout-editor'>" +
      "<div class='x-handle'>&Dagger; <span>Theme: " + app.data.theme.name + "</span></div>" +
      "<h4>Current Template <span>&and;</span></h4>" +
      "</div>");

    $editor = this.$("#x-layout-editor");

    $editor.append(app.reuseView("templates_select").render().$el)
      .append("<div id='x-customize-button'><a class='x-btn x-btn-primary'>Customize Theme</a></div>");

    if (!app.editor.preview_only) {
      $editor.append(app.reuseView("download_button").render().$el);
    }

    return this;
  }

  // Drag the editor box
  , dragInit: function (e, drag) {
    var mouse = drag.mouseElementPosition;

    drag.representative($(drag.element).parent(), mouse.left(), mouse.top()).only();
  }

  // Keep the editor box above other elements when moving
  , dragMove: function (e, drag) {
    $(drag.element).parent().css("zIndex", 9999);
  }

  , stopPropagation: function () {
    return false;
  }

  , loadEditor: function (e) {
    window.top.Backbone.history.navigate(window.top.Backbone.history.fragment + "/fork", true);
  }
});
