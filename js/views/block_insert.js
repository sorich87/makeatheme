define([
	"jquery",
	"underscore",
	"backbone"
], function ($, _, Backbone) {

	var BlockView = Backbone.View.extend({
		el: $("<div id='x-block-insert'><h4>Blocks</h4><p>Drag and drop to insert</p><ul></ul></div>")

		, initialize: function () {
			this.buildBox();
			this.loadBlocks();
		}

		, loadBlocks: function () {
			this.collection.reset(this.collection.models);
		}

		, buildBox: function () {
			this.collection.on("reset", this.addAll, this);

			$(window.document).on({
				draginit: function (e, drag) {
					drag.ghost();
				}

				, dragend: $.proxy(function (e, drag) {
					var block = this.collection.get(drag.element.data("id"));

					require([
						"text!templates/" + block.get("filename")
					], function (blockTemplate) {
						drag.element[0].outerHTML = "<div class='columns'>" + blockTemplate + "</div>";
					});
				}, this)
			}, "#x-block-insert a");
		}

		, addOne: function (block) {
			var name = block.get("name")
				, id = block.get("id");

			this.$el.children("ul").append("<li><a href='#' data-id='" + id + "'><span>&Dagger;</span> " + name + "</a></li>");
		}

		, addAll: function () {
			_.each(this.collection.models, function (block) {
				this.addOne(block);
			}, this);

			$("#x-layout-editor").append(this.$el);
		}
	});

	return BlockView;
});
