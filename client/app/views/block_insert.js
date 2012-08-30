// Display list of blocks to insert
var View = require("views/base/view")
  , Blocks = require("collections/blocks")
  , app = require("application");

module.exports = View.extend({
    el: $("<div id='x-block-insert'><h4>Blocks</h4>\
          <p>Drag and drop to insert</p><ul></ul></div>")

  , collection: new Blocks(app.data.theme_pieces.blocks)

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
    _.each(this.collection.models, function (block) {
      this.addOne(block);
    }, this);
  }

  // Replace the drag element by its clone
  , dragInit: function (e, drag) {
    drag.element = drag.ghost();
  }

  // Load the actual template chuck to insert
  , dragEnd: function (e, drag) {
    var block = this.collection.getByCid(drag.element.data("cid"));

    drag.element[0].outerHTML = block.get("build");
  }
});
