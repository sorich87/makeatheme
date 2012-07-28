define([
  'jquery',
  'underscore',
  'backbone',
  'views/base'
  ], function ($, _, Backbone, BaseView) {

  var LayoutView = BaseView.extend({
      el: $("html")

    , initialize: function (options) {
      this.constructor.__super__.initialize.apply(this, [options])
    }

    , switchModes: function () {
      var _this = this
        , preventDefault = function (e) {
          e.preventDefault();
        };

      EventDispatcher.on("mode:edit", function () {
        require([
                "jquerypp/event/drag",
                "jquerypp/event/drag.limit",
                "jquerypp/event/drop"
        ], function () {
          // Links in draggable areas shouldn't be clickable
          _this.$(".columns a").on("click", preventDefault);

          _this.$el.on({
            draginit: function (ev, drag) {
              // Limit drag to first container
              drag.limit($("body").children());
            }

            , dragdown: function (ev, drag) {
              // Cancel drag on editable areas to allow edit
              if ($(ev.target).attr("contenteditable") === true || $(ev.target).hasClass("x-edit")) {
                drag.cancel();
              }
            }
          }, ".columns");

          _this.$el.on({
            dropon: function (ev, drop, drag) {
              var rowWidth, totalColumnsWidth, dragParent;

              // Width of the drop row
              rowWidth = $(this).width();

              // Total width of all columns children of the drop row
              totalColumnsWidth = _.reduce($(this).children(), function (memo, child) {
                if ($(child).is(drag.element)) {
                  return memo;
                } else {
                  return memo + parseFloat($(child).outerWidth());
                }
              }, 0, this);

              // Add column to row. If the row is full, add a new one
              if ((rowWidth - totalColumnsWidth) >= (rowWidth * 8.333 / 100)) {
                row = this;
              } else {
                row = $("<div class='row'></div>").insertAfter(this);
              }

              // Save original parent then append the column to drop row
              dragParent = $(drag.element).parent();

              $(drag.element).appendTo(row).css({top: 0, left: 0});

              // If original parent doesn't have any more children,
              // remove it
              if ($(dragParent).children().length <= 0) {
                $(dragParent).remove();
              }
            }
          }, ".row");
        });
      });

      EventDispatcher.on("mode:view", function () {
        require(["jquerypp/event/drag"], function () {
          // Unbind drag events
          _this.$el.off("draginit", ".columns");
          _this.$el.off("dragdown", ".columns");

          // Links are clickable again
          _this.$(".columns a").off("click", preventDefault);
        });
      });
    }
  });

  return LayoutView;
});
