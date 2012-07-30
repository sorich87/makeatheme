define([
  'jquery',
  'underscore',
  'backbone',
  "jquerypp/event/drag",
  "jquerypp/event/drag.limit",
  "jquerypp/event/drop"
  ], function ($, _, Backbone) {

  var LayoutView = Backbone.View.extend({
      el: $("body")

    , initialize: function () {
      this.highlightColumns();
      this.setupDragAndDrop();
      this.setupResize();
    }

    , highlightColumns: function () {
      this.$el.on("hover", ".columns", function (e) {
        $(".columns.x-edit").removeClass("x-edit");
        $(e.currentTarget).addClass("x-edit")

        if (e.currentTarget.lastChild.className !== 'x-resize') {
          e.currentTarget.innerHTML += "<div class='x-resize'>&harr;</div>";
        }
      });
    }

    , setupDragAndDrop: function () {
      var preventDefault, totalColumnsWidth, isRowFull, gradPosition;

      preventDefault = function (e) {
        if (!this.isContentEditable) {
          e.preventDefault();
        }
      };

      totalColumnsWidth = function (dropElement, dragElement) {
        return _.reduce($(dropElement).children(), function (memo, child) {
          if ($(child).is(dragElement)) {
            return memo;
          } else {
            return memo + parseFloat($(child).outerWidth());
          }
        }, 0);
      };

      // Does total width of all columns children of a drop row
      // allow a new column?
      isRowFull = function (dropElement, dragElement) {
        var rowWidth = $(dropElement).width();

        return (rowWidth - totalColumnsWidth(dropElement, dragElement)) < (rowWidth * 8.333 / 100);
      };

      // Links in draggable areas shouldn't be clickable
      this.$el.on("click", ".columns a", preventDefault);

      // Links and images in draggable areas shoulnd't be draggable
      this.$el.on("mousedown", ".columns a, .columns img", preventDefault);

      this.$el.on({
          draginit: function (ev, drag) {
          var $dragElement = $(drag.element);

          dragPosition = {
              position: $dragElement.css("position")
            , top: $dragElement.css("top")
            , bottom: $dragElement.css("bottom")
            , left: $dragElement.css("left")
            , right: $dragElement.css("right")
          };

          // Limit drag to first container
          drag.limit($("body").children());
        }

        , dragdown: function (ev, drag) {
          // Cancel drag on editable areas to allow edit
          if ($(ev.target).is(".x-edit") || $(ev.target).is("[contenteditable=true]")) {
            drag.cancel();
          }
        }

        , dragend: function (ev, drag) {
          // Reset position
          $(drag.element).css(dragPosition);
        }
      }, ".columns");

      this.$el.on({
          dropinit: function (ev, drop, drag) {
          var $drag = $(drag.element);

          if ($drag.hasClass("x-resize")) {
            drop.cancel();
          }
        }

        , dropover: function (ev, drop, drag) {
          // Mark the row as full or not
          if (isRowFull(this, drag.element)) {
            $(this).addClass("x-full");
          } else {
            $(this).addClass("x-not-full");
          }
        }

        , dropout: function (ev, drop, drag) {
          // Remove x-full or x-not-full class if previously added
          $(this).removeClass("x-full x-not-full");
        }

        , dropon: function (ev, drop, drag) {
          var row, $drag, $dragParent, $dragGrandParent;

          // Save original parent
          $drag = $(drag.element);
          $dragParent = $drag.parent();

          // Add column to row. If the row is full, add to a new one
          if (isRowFull(this, $drag)) {
            row = $("<div class='row'></div>").insertAfter(this);
          } else {
            row = this;
          }
          $drag.appendTo(row);

          $(this).removeClass("x-empty");

          // If original parent doesn't have any more children
          // and is not a <header> or <footer> and has no id attribute, remove it
          if ($dragParent.children().length === 0 ) {
            $dragGrandParent = $dragParent.parent();

            if (($dragGrandParent.is("header, footer") && $dragGrandParent.children().length === 1)
                || $dragParent.attr("id") !== undefined) {
              $dragParent.addClass("x-empty");
            } else {
              $dragParent.remove();
            }
          }

          // Remove x-full and x-not-full classes if one was previously added
          $(this).removeClass("x-full x-not-full");
        }
      }, ".row");
    }

    , setupResize: function () {
      var dragPosition;

      this.$el.on({
        draginit: function (e, drag) {
          var $dragElement = $(drag.element);

          // Resize is done horizontally
          drag.horizontal();

          // Save element position to reset it later
          dragPosition = {
              position: $dragElement.css("position")
            , top: $dragElement.css("top")
            , bottom: $dragElement.css("bottom")
            , left: $dragElement.css("left")
            , right: $dragElement.css("right")
          };
        }
        , dragmove: function (e, drag) {
          var $column = $(this).parent()
            , $row = $column.parent();

          width = drag.location.x() - $column.offset().left;
          if (width >= $row.width()) {
            width = $row.width();
            e.preventDefault();
          }

          $column.width(width);
        }

        , dragend: function (ev, drag) {
          // Reset position
          $(drag.element).css(dragPosition);
        }
      }, ".x-resize");
    }
  });

  return LayoutView;
});
