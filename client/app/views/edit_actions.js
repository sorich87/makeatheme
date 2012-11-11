var app = require("application")
  , View = require("views/base/view")
  , mutations = require("lib/mutations")
  , accordion_group = require("views/templates/accordion_group");

module.exports = View.extend({
  panels: [
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

  , initialize: function () {
    _.bindAll(this, "accordionGroups");
  }

  , render: function () {
    app.createView("regions");
    app.createView("blocks");
    app.createView("style_edit");
    app.createView("share_link");
    app.createView("save_button");
    app.createView("download_button");

    // Setup drag and drop and resize
    app.createView("layout").render();

    this.$el.empty()
      .append("<div class='accordion'>" + this.accordionGroups() + "</div>")
      .append(app.reuseView("save_button").render().$el)
      .append(app.reuseView("download_button").render().$el);

    for (var i in this.panels) {
      if (!this.panels.hasOwnProperty(i)) {
        return;
      }

      this.$("#editor-" + this.panels[i].id + " .accordion-inner")
        .empty()
        .append(app.reuseView(this.panels[i].id).render().$el);
    }

    document.body.className = "editor";

    mutations.initialize();

    return this;
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
