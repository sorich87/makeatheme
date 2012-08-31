var app = require("application")
  , View = require("views/base/view");

module.exports = View.extend({
  el: "<div id='x-layout-editor'>\
      <div class='x-handle'>&Dagger;</div>\
      </div>"

  , events: {
      "draginit #x-layout-editor .x-handle": "dragInit"
    , "dragmove #x-layout-editor .x-handle": "dragMove"
  }

  , initialize: function () {
    app.createView("templates").render();

    _.bindAll(this, "render");

    app.on("templateLoaded", this.render);
  }

  // Show editor when "templateLoaded" event is triggered
  , render: function () {
    var templatesView = app.reuseView("templates");

    this.$el.append(templatesView.$el);

    // Reset template select events
    templatesView.delegateEvents();

    if (app.data.preview_only !== true) {
      this.$el
        .append(app.reuseView("block_insert").render().$el)
        .append(app.reuseView("style_edit").render().$el)
        .append(app.reuseView("download_button").render().$el)
        .append(app.reuseView("share_link").render().$el);

      app.reuseView("mutations");
    }

    this.$el.appendTo($("body"));

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
});
