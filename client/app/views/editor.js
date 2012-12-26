var app = require("application")
  , View = require("views/base/view")
  , mutations = require("lib/mutations");

module.exports = View.extend({
  id: "layout-editor"

  , initialize: function () {
    $(window).on("resize", this.resize.bind(this));

    View.prototype.initialize.call(this);
  }

  , teardown: function () {
    $(window).off("resize", this.resize.bind(this));

    View.prototype.teardown.call(this);
  }

  // Show editor when "template:loaded" event is triggered
  , render: function () {
    var blocksView = app.createView("blocks"),
        styleEditView = app.createView("style_edit"),
        layoutView = app.createView("layout"),
        editorToggleView = app.createView("editor_toggle");

    this.subViews.push(editorToggleView, blocksView, styleEditView, layoutView);

    this.$el.empty()
      .append(editorToggleView.render().$el)
      .append(blocksView.render().$el)
      .append(styleEditView.render().$el.hide());

    this.$el.appendTo($("#main", window.top.document));

    layoutView.render();

    mutations.initialize();

    this.resize();
    this.preventActions();

    app.trigger("editor:loaded");

    return this;
  }

  , resize: function () {
    this.$el.height($(window.top).height() - 40);
  }

  // Prevent click, drag and submit on links, images and forms
  // respectively in the iframe
  , preventActions: function () {
    $("body").on("click", ".column a", this.preventDefault)
      .on("mousedown", ".column a, .column img", this.preventDefault)
      .on("submit", ".column form", this.preventDefault);
  }

  , preventDefault: function (e) {
    e.preventDefault();
  }
});
