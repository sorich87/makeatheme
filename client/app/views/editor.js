var app = require("application")
  , View = require("views/base/view")
  , data = require("lib/editor_data")
  , mutations = require("lib/mutations")
  , theme_meta = require("views/templates/theme_meta")
  , accordion_group = require("views/templates/accordion_group");

module.exports = View.extend({
  id: "layout-editor"

  , initialize: function () {
    _.extend(app.editor, {
        preview_only: !!app.data.preview_only
      , templates: data.templates
      , regions: data.regions
      , blocks: data.blocks
      , style: data.style
    });

    $(window).on("resize", this.resize.bind(this));

    View.prototype.initialize.call(this);
  }

  , teardown: function () {
    $(window).off("resize", this.resize.bind(this));

    View.prototype.teardown.call(this);
  }

  // Show editor when "template:loaded" event is triggered
  , render: function () {
    var editorToggleView = app.createView("editor_toggle"),
        themeMetaView = app.createView("theme_meta"),
        actionsView = app.createView("edit_actions");

    this.subViews.push(editorToggleView, themeMetaView, actionsView);

    this.$el.empty()
      .append(editorToggleView.render().$el)
      .append(themeMetaView.render().$el)
      .append(actionsView.render().$el);

    this.$el.appendTo($("#main", window.top.document));

    this.resize();
    this.preventActions();

    app.trigger("editor:loaded");

    return this;
  }

  , resize: function () {
    this.$el.height($(window.top).height() - 40);

    $("#canvas", window.top.document).width($(window.top).width() - 250);
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
