var app = require("application")
  , View = require("views/base/view");

module.exports = View.extend({
  el: "<div id='x-layout-editor'>\
      <div class='x-handle'></div>\
      </div>"

  , events: {
      "draginit #x-layout-editor .x-handle": "dragInit"
    , "dragmove #x-layout-editor .x-handle": "dragMove"
    , "click h4": "showSection"
  }

  // Show editor when "templateLoaded" event is triggered
  , render: function () {
    this.$el
      .children(".x-handle").empty()
        .append("&Dagger; <span>Theme: " + app.data.theme.name + "</span>")
        .end()
      .append("<h4>Current Template <span>&and;</span></h4>")
      .append(app.reuseView("templates").render().$el);

    if (app.data.preview_only !== true) {
      this.$el
        .append("<h4>Header &amp; Footer <span>&and;</span></h4>")
        .append(app.reuseView("regions").render().$el)
        .append("<h4>Page Elements <span>&or;</span></h4>")
        .append(app.reuseView("block_insert").render().$el)
        .append("<h4>Style <span>&or;</span></h4>")
        .append(app.reuseView("style_edit").render().$el)
        .append("<h4>Share <span>&or;</span></h4>")
        .append(app.reuseView("share_link").render().$el)
        .append(app.reuseView("download_button").render().$el);

      app.reuseView("mutations");

      this.$(".x-section:not(#x-templates-select, #x-region-select)").hide();
    }

    this.$el.appendTo($("body"));

    return this;
  }

  , showSection: function (e) {
    $(e.target).next().slideToggle("slow", function () {
      var $this = $(this)
        , $handle = $this.prev().children("span").empty();

      if ($this.is(":hidden")) {
        $handle.append("&or;");
      } else {
        $handle.append("&and;");
      }
    });
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
