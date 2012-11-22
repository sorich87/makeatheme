var app = require("application")
  , View = require("views/base/view")
  , data = require("lib/editor_data")
  , mutations = require("lib/mutations")
  , theme_meta = require("views/templates/theme_meta")
  , accordion_group = require("views/templates/accordion_group")
  , copy_button = require("views/templates/copy_button");

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
  }

  // Show editor when "template:loaded" event is triggered
  , render: function () {
    var actions_view;

    this.$el.empty()
      .append(app.createView("editor_toggle").render().$el)
      .append(app.createView("device_switch").render().$el)
      .append(app.createView("theme_meta").render().$el);

    if (app.data.theme.author_id === app.currentUser.id) {
      actions_view = "edit_actions";
    } else {
      actions_view = "preview_actions";
    }

    this.$el.append(app.createView(actions_view).render().$el);

    this.$el.appendTo($("#main", window.top.document));

    this.resize();
    this.preventActions();

    app.trigger("editor:loaded");

    return this;
  }

  , resize: function () {
    this.$el.height($(window.top).height() - 60);
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
