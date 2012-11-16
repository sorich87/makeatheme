// Display list of blocks to insert
var View = require("views/base/view")
  , template = require("views/templates/blocks")
  , app = require("application");

module.exports = View.extend({
    id: "x-block-insert"
  , className: "x-section"
  , collection: app.editor.blocks

  , events: {
      "click .new-block": "showForm"
    , "submit .new-block-select": "addBlock"
    , "click .close": "removeBlock"
    , "mouseover .x-drag": "makeDraggable"
  }

  , initialize: function () {
    this.collection.on("reset", this.addAll, this);
    this.collection.on("add", this.addOne, this);
    this.collection.on("remove", this.removeOne, this);

    app.on("mutations:started", this.makeMutable.bind(this));
    app.on("save:before", this.addThemeAttributes.bind(this));
    app.on("block:inserted", this.insertBlock.bind(this));

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

  , makeDraggable: function (e) {
    this.$(e.currentTarget).draggable({
        addClasses: false
      , helper: function() {
        // Append a clone to the body to avoid overflow on parent accordion.
        return $(this).clone().appendTo("body");
      }
      , revert: "invalid"
      , scroll: false
      , zIndex: 99999
    });
  }

  , addOne: function (block) {
    var remove = "";

    if (block.get("label") != "Default") {
      remove = " <span class='close' title='Delete block'>&times;</span>";
    }

    this.$("ul").append("<li class='x-drag' data-cid='" + block.cid + "'>" +
                        "<span>&Dagger;</span> " + block.label() + remove + "</li>");
  }

  , addAll: function () {
    this.$("ul").empty();

    _.each(this.collection.models, function (block) {
      this.addOne(block);
    }, this);
  }

  , removeOne: function (block) {
    this.$("span[data-cid='" + block.cid + "']").closest("li").remove();
  }

  // If the element is inserted in a row,
  // load the actual template chuck to insert
  , insertBlock: function (element, id) {
    var block = this.collection.getByCid($(element).data("cid"));

    element.outerHTML = "<div id='" + id + "' class='column " +
      block.className() + "'>" + block.get("build") + "</div>";

    app.trigger("node:added", window.document.getElementById(id));
  }

  , makeMutable: function (pieces) {
    pieces.blocks = this.collection;
  }

  , showForm: function (e) {
    var $div = this.$(".new-block-select");

    if ($div.is(":hidden")) {
      $div.show("normal");
    } else {
      $div.hide("normal");
    }
  }

  , addBlock: function (e) {
    var name, label, attributes, block, build;

    e.preventDefault();

    name = this.$(".new-block-select select").val();
    label = this.$(".new-block-name").val();

    if (!label) {
      app.trigger("notification", "error", "Please, enter a block name.");
      return;
    }

    attributes = _.clone(_.find(this.allBlocks, function (block) {
      return block.name === name;
    }));

    build = (new DOMParser()).parseFromString(attributes.build, "text/html").body;
    build.firstChild.setAttribute("data-x-label", label);
    build.firstChild.setAttribute("data-x-name", name);

    attributes.build = build.outerHTML;
    attributes.label = label;

    this.collection.add(attributes);
    this.render();

    app.trigger("notification", "success", "New block created. Drag and drop into the page to add it.");
  }

  , removeBlock: function (e) {
    if (confirm("Are you sure you want to delete this block?")) {
      var cid = $(e.currentTarget).parent().data("cid");
      this.collection.remove(cid);
      this.render();
    }
  }

  , addThemeAttributes: function (attributes) {
    attributes.blocks = _.map(this.collection.models, function (block) {
      return _.pick(block.attributes, "_id", "name", "label", "template");
    });
  }
});
