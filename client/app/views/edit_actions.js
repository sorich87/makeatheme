var app = require("application")
  , View = require("views/base/view")
  , mutations = require("lib/mutations")
  , accordion_group = require("views/templates/accordion_group");

module.exports = View.extend({
  id: "edit-actions"

  , panels: [
      {
        id: "blocks"
      , title: "Blocks"
      , view: "blocksView"
    }
  ]

  , render: function () {
    this.blocksView = app.createView("blocks");
    this.styleEditView = app.createView("style_edit");
    this.layoutView = app.createView("layout");

    this.subViews.push(this.blocksView, this.styleEditview, this.layoutView);

    // Setup drag and drop and resize
    this.layoutView.render();

    this.$el.empty()
      .append("<div id='general'></div>")
      .children()
        .append("<div class='accordion'>" + this.accordionGroups.apply(this) + "</div>")
        .end()
      .append(this.styleEditView.render().$el.hide());

    for (var i in this.panels) {
      if (!this.panels.hasOwnProperty(i)) {
        return;
      }

      this.$("#editor-" + this.panels[i].id + " .accordion-inner")
        .empty()
        .append(this[this.panels[i].view].render().$el);
    }

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
