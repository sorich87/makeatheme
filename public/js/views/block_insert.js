define([
  "jquery",
  "underscore",
  "backbone"
], function ($, _, Backbone) {

  var BlockView = Backbone.View.extend({
      el: $("<div id='x-block-insert'><h4>Blocks</h4>\
            <p>Drag and drop to insert</p><ul></ul></div>")

    , initialize: function () {
      this.bindEvents();
    }

    , render: function () {
      this.collection.reset(this.collection.models);

      return this;
    }

    , bindEvents: function () {
      this.collection.on("reset", this.addAll, this);

      $(window.document).on("draginit", "#x-block-insert a", this.draginit);
      $(window.document).on("dragend", "#x-block-insert a", $.proxy(this.dragend, this));
    }

    , addOne: function (block) {
      var name = block.get("name")
      , id = block.get("id");

      this.$("ul").append("<li><a href='#' data-id='" + id + "'>\
                          <span>&Dagger;</span> " + name + "</a></li>");
    }

    , addAll: function () {
      this.$("ul").empty();

      _.each(this.collection.models, function (block) {
        this.addOne(block);
      }, this);
    }

    // Replace the drag element by its clone
    , draginit: function (e, drag) {
      drag.element = drag.ghost();
    }

    // Load the actual template chuck to insert
    , dragend: function (e, drag) {
      var block = this.collection.get(drag.element.data("id"));

      require([
        "text!templates/blocks/" + block.get("filename") + ".html"
      ], function (blockTemplate) {
        drag.element[0].outerHTML = blockTemplate;
      });
    }
  });

  return BlockView;
});
