var app = require("application")
  , View = require("views/base/view")
  , data = require("lib/editor_data")
  , mutations = require("lib/mutations")
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
      .append("<div id='theme-name'>Theme: " + app.data.theme.name + "</div>");

    if (app.data.theme.author_id === app.currentUser.id) {
      actions_view = "edit_actions";
    } else {
      actions_view = "preview_actions";
    }

    this.$el.append(app.createView(actions_view).render().$el);

    if (!app.editor.preview_only) {
      this.$el.append(app.createView("download_button").render().$el);
    }

    this.$el.appendTo($("#main", window.top.document));

    this.resize();

    return this;
  }

  , resize: function () {
    this.$el.height($(window.top).height() - 60);
  }
});
