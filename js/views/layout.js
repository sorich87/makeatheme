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

          // Links and images in draggable areas shoulnd't be draggable
          _this.$(".columns a, .columns img").on("mousedown", preventDefault);

          // Does total width of all columns children of a drop row
          // allow a new column?
          var isRowFull = function (dropElement, dragElement) {
            var rowWidth = $(dropElement).width()
              , totalColumnsWidth = _.reduce($(dropElement).children(), function (memo, child) {
              if ($(child).is(dragElement)) {
                return memo;
              } else {
                return memo + parseFloat($(child).outerWidth());
              }
            }, 0, this);

            return (rowWidth - totalColumnsWidth) < (rowWidth * 8.333 / 100);
          };

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

            , dragend: function (ev, drag) {
              // Reset positioning
              $(drag.element).animate({top: 0, left: 0});
            }
          }, ".columns");

          _this.$el.on({
            dropover: function (ev, drop, drag) {
              if (isRowFull(this, drag.element)) {
                $(this).addClass("x-full");
              } else {
                $(this).addClass("x-not-full");
              }
            }

            , dropout: function (ev, drop, drag) {
              // Remove x-full and x-not-full classes if one was previously added
              $(this).removeClass("x-full x-not-full");
            }

            , dropon: function (ev, drop, drag) {
              var row, dragParent;

              // Save original parent
              dragParent = $(drag.element).parent();

              // Add column to row. If the row is full, add to a new one
              if (isRowFull(this, drag.element)) {
                row = $("<div class='row'></div>").insertAfter(this);
              } else {
                row = this;
              }
              $(drag.element).appendTo(row);

              // If original parent doesn't have any more children,
              // remove it
              if ($(dragParent).children().length <= 0) {
                $(dragParent).remove();
              }

              // Remove x-full and x-not-full classes if one was previously added
              $(this).removeClass("x-full x-not-full");
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

          // Links and images are draggable again
          _this.$(".columns a, .columns img").off("mousedown", preventDefault);
        });
      });
    }
  });

  return LayoutView;
});
