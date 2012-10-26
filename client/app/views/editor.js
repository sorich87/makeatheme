var app = require("application")
  , View = require("views/base/view")
  , data = require("lib/editor_data")
  , accordion_group = require("views/templates/accordion_group");

module.exports = View.extend({
  id: "layout-editor"

  , panels: [
      {
        id: "templates"
      , title: "Current Template"
    }
    , {
        id: "regions"
      , title: "Header &amp; Footer"
    }
    , {
        id: "blocks"
      , title: "Blocks"
    }
    , {
        id: "style_edit"
      , title: "Style"
    }
    , {
        id: "share_link"
      , title: "Share"
    }
  ]


  , events: {
    "click #customize-button button": "showEditor"
  }

  , initialize: function () {
    _.extend(app.editor, {
        preview_only: !!app.data.preview_only
      , templates: data.templates
      , regions: data.regions
      , blocks: data.blocks
      , style: data.style
    });

    _.bindAll(this, "accordionGroups");
  }

  // Show editor when "template:loaded" event is triggered
  , render: function () {
    if (this.editor) {
      this.render_editor();
    } else {
      this.render_preview();
    }

    if (!app.editor.preview_only) {
      this.$el.append(app.createView("download_button").render().$el);
    }

    this.$el.insertAfter($("#main", window.top.document))
      .height($(window.top).height() - 60);

    return this;
  }

  , render_preview: function () {
    this.$el
      .empty()
      .append("<div id='theme-name'>Theme: " + app.data.theme.name + "</div>")
      .append(app.reuseView("templates_select").render().$el)
      .append("<div id='customize-button'><button class='btn btn-primary'>Customize Theme</button></div>");
  }

  , render_editor: function () {
    var regionsView = app.reuseView("regions")
      , blocksView = app.reuseView("blocks")
      , styleView = app.reuseView("style_edit")
      , shareView = app.reuseView("share_link")
      , saveView = app.reuseView("save_button")
      , downloadView = app.reuseView("download_button")
      , accordionGroups;

    this.$el
      .empty()
      .append("<div id='theme-name'>Theme: " + app.data.theme.name + "</div>")
      .append("<div class='accordion'>" + this.accordionGroups() + "</div>")
      .append(saveView.render().$el)
      .append(downloadView.render().$el);

    for (var i in this.panels) {
      if (!this.panels.hasOwnProperty(i)) {
        return;
      }

      this.$("#editor-" + this.panels[i].id + " .accordion-inner")
        .empty()
        .append(app.reuseView(this.panels[i].id).render().$el);
    }

    app.reuseView("mutations");

    // Setup drag and drop and resize
    app.createView("layout").render();
  }

  , showSection: function (e) {
    $(e.target).next().slideToggle("slow", function () {
      var $this = $(this)
        , $handle = $this.prev().children("span");

      if ($this.is(":hidden")) {
        $handle.empty().append("&or;");
      } else {
        $handle.empty().append("&and;");
      }
    });
  }

  , showEditor: function (e) {
    this.editor = true;

    this.render();
  }

  , accordionGroups: function () {
    var groups = "";

    for (var i in this.panels) {
      if (this.panels.hasOwnProperty(i)) {
        groups += this.buildAccordionGroup(this.panels[i]);
      }
    }

    return groups;
  }

  , buildAccordionGroup: function (attributes) {
    return accordion_group({
        parent: "editor-accordion"
      , id: "editor-" + attributes.id
      , title: attributes.title
      , content: ""
    });
  }
});
