// Display list of blocks to insert
var View = require("views/base/view")
  , template = require("views/templates/blocks")
  , app = require("application");

module.exports = View.extend({
    id: "x-block-insert"
  , className: "x-section"
  , collection: app.editor.blocks

  , events: {
      "draginit #x-block-insert .x-drag": "dragInit"
    , "dragend #x-block-insert .x-drag": "dragEnd"
    , "click .x-new-block": "showForm"
    , "click .x-new-block-add": "addBlock"
  }

  , initialize: function () {
    _.bindAll(this, "makeMutable");

    this.collection.on("reset", this.addAll, this);
    this.collection.on("add", this.addOne, this);

    app.on("mutations:started", this.makeMutable);

    this.allBlocks = _.map(app.data.blocks, function (block) {
      block.label = _.str.titleize(_.str.humanize(block.name));
      return block;
    });
  }

  , render: function () {
    this.$el.empty().append(template({all: this.allBlocks}));

    this.collection.reset(this.collection.models);

    return this;
  }

  , addOne: function (block) {
    this.$("ul").append("<li><span class='x-drag' data-cid='" + block.cid + "'>" +
                        "<span>&Dagger;</span> " + block.label() + "</span></li>");
  }

  , addAll: function () {
    this.$("ul").empty();

    _.each(this.collection.models, function (block) {
      this.addOne(block);
    }, this);
  }

  // Replace the drag element by its clone
  , dragInit: function (e, drag) {
    drag.element = drag.ghost();
  }

  // If the element is inserted in a row,
  // load the actual template chuck to insert
  , dragEnd: function (e, drag) {
    var block = this.collection.getByCid(drag.element.data("cid"));

    app.trigger("block:inserted", block, drag.element);
  }

  , makeMutable: function (pieces) {
    pieces.blocks = this.collection;
  }

  , showForm: function (e) {
    var $div = this.$(".x-new-block-select");

    if ($div.is(":hidden")) {
      $div.show("normal");
    } else {
      $div.hide("normal");
    }
  }

  , addBlock: function () {
    var name, label, attributes, block, build;

    name = this.$(".x-new-block-select select").val();
    label = this.$(".x-new-block-name").val();

    if (!label) {
      app.trigger("notification", "error", "Please, enter a block name.");
      return;
    }

    attributes = _.find(this.allBlocks, function (block) {
      return block.name === name;
    });

    build = (new DOMParser()).parseFromString(attributes.build, "text/html").body;
    build.firstChild.setAttribute("data-x-label", label);
    build.firstChild.setAttribute("data-x-name", name);

    attributes.build = build.outerHTML;
    attributes.label = label;

    this.collection.add(attributes);

    app.trigger("notification", "success", "New block created. Drag and drop into the page to add it.");
  }
});
