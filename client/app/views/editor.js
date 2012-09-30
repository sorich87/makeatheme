var app = require("application")
  , View = require("views/base/view")
  , data = require("lib/editor_data");

module.exports = View.extend({
  el: "<div id='x-layout-editor'>" +
      "<div class='x-handle'></div>" +
      "</div>"

  , events: {
      "draginit #x-layout-editor .x-handle": "dragInit"
    , "dragmove #x-layout-editor .x-handle": "dragMove"
    , "click h4": "showSection"
  }

  , initialize: function () {
    _.extend(app.editor, {
        preview_only: !!app.data.preview_only
      , templates: data.templates
      , regions: data.regions
      , blocks: data.blocks
      , style: data.style
      , fork: this.options.fork
    });
  }

  // Show editor when "template:loaded" event is triggered
  , render: function () {
    var regionsView = app.reuseView("regions")
      , blocksView = app.reuseView("block_insert")
      , styleView = app.reuseView("style_edit")
      , shareView = app.reuseView("share_link")
      , saveView = app.reuseView("save_button")
      , downloadView = app.reuseView("download_button");

    this.$el
      .children(".x-handle").empty()
        .append("&Dagger; <span>Theme: " + app.data.theme.name + "</span>")
        .end()
      .append("<h4>Current Template <span>&and;</span></h4>")
      .append(app.reuseView("templates").render().$el);

    if (!app.editor.preview_only) {
      this.$el
        .append("<h4>Header &amp; Footer <span>&and;</span></h4>")
        .append(regionsView.render().$el)
        .append("<h4>Blocks <span>&or;</span></h4>")
        .append(blocksView.render().$el)
        .append("<h4>Style <span>&or;</span></h4>")
        .append(styleView.render().$el)
        .append("<h4>Share <span>&or;</span></h4>")
        .append(shareView.render().$el)
        .append(saveView.render().$el)
        .append(downloadView.render().$el);

      app.reuseView("mutations");

      // Setup drag and drop and resize
      app.createView("layout").render();

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
