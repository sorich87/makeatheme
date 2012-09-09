// Display list of blocks to insert
var View = require("views/base/view")
  , Blocks = require("collections/blocks")
  , app = require("application")
  , idIncrement = 1;

module.exports = View.extend({
    id: "x-block-insert"
  , className: "x-section"
  , collection: app.blocks

  , events: {
      "draginit #x-block-insert .x-drag": "dragInit"
    , "dragend #x-block-insert .x-drag": "dragEnd"
  }

  , initialize: function () {
    this.collection.on("reset", this.addAll, this);
  }

  , render: function () {

    this.$el.empty().append("<p>Drag and drop to insert</p><ul></ul>");

    this.collection.reset(this.collection.models);

    return this;
  }

  , addOne: function (block) {
    this.$("ul").append("<li><span class='x-drag' data-cid='" + block.cid + "'>\
                        <span>&Dagger;</span> " + block.label() + "</span></li>");
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
    if (drag.element.parent().hasClass("row")) {
      var block = this.collection.getByCid(drag.element.data("cid"));

      drag.element[0].outerHTML = "<div id='z-" + idIncrement + "' class='columns "
        + block.className() + "'>" + block.get("build") + "</div>";

      idIncrement++;
    }
  }
});
