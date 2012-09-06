// Display list of blocks to insert
var View = require("views/base/view")
  , Blocks = require("collections/blocks")
  , app = require("application")
  , idIncrement = 1;

module.exports = View.extend({
    el: $("<div id='x-block-insert'><h4>Blocks</h4>\
          <p>Drag and drop to insert</p><ul></ul></div>")

  , collection: app.blocks

  , events: {
      "draginit #x-block-insert a": "dragInit"
    , "dragend #x-block-insert a": "dragEnd"
  }

  , initialize: function () {
    this.collection.on("reset", this.addAll, this);
  }

  , render: function () {
    this.collection.reset(this.collection.models);

    return this;
  }

  , addOne: function (block) {
    this.$("ul").append("<li><a href='#' data-cid='" + block.cid + "'>\
                        <span>&Dagger;</span> " + block.label() + "</a></li>");
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
