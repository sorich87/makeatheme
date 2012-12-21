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
        deviceSwitchView = app.createView("device_switch"),
        themeMetaView = app.createView("theme_meta");

    this.subViews.push(editorToggleView, deviceSwitchView, themeMetaView);

    this.$el.empty()
      .append(editorToggleView.render().$el)
      .append(deviceSwitchView.render().$el)
      .append(themeMetaView.render().$el);

    if (app.data.theme.author_id === app.currentUser.id) {
      this._showEdit();
    } else {
      this._showPreview();
    }

    this.$el.appendTo($("#main", window.top.document));

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

  , _showEdit: function () {
    var editView = app.createView("edit_actions");

    this.subViews.push(editView);

    editView.render().$el.appendTo(this.$el);
  }
});
