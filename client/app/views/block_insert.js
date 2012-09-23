// Display list of blocks to insert
var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    id: "x-block-insert"
  , className: "x-section"
  , collection: app.editor.blocks

  , events: {
      "draginit #x-block-insert .x-drag": "dragInit"
    , "dragend #x-block-insert .x-drag": "dragEnd"
  }

  , initialize: function () {
    _.bindAll(this, "makeMutable");

    this.collection.on("reset", this.addAll, this);

    app.on("mutations:started", this.makeMutable);
  }

  , render: function () {

    this.$el.empty().append("<p>Drag and drop to insert</p><ul class='x-rects'></ul>");

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
});
