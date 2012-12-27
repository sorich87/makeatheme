var app = require("application")
  , View = require("views/base/view")
  , mutations = require("lib/mutations");

module.exports = View.extend({
  initialize: function () {
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
        layoutView = app.createView("layout");

    this.subViews.push(blocksView, styleEditView, layoutView);

    this.$el.empty()
      .append(blocksView.render().$el)
      .append(styleEditView.render().$el);

    this.$el.appendTo($("#main", window.top.document));

    layoutView.render();

    mutations.initialize();

    this.resize();
    this.preventActions();

    return this;
  }

  , resize: function () {
    this.$(".editor-sidebar").height($(window.top).height() - 60);
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
