define([
  'jquery',
  'underscore',
  'backbone',
  "jquerypp/event/drag",
  "jquerypp/event/drag.limit",
  "jquerypp/event/drop"
  ], function ($, _, Backbone) {
  var LayoutView, totalColumnsWidth, isRowFull;

  // Return total width of all columns children of a row
  // except the one being dragged
  totalColumnsWidth = function (dropElement, dragElement) {
    return _.reduce($(dropElement).children(), function (memo, child) {
      if ($(child).is(dragElement)) {
        return memo;
      } else {
        return memo + $(child).outerWidth(true);
      }
    }, 0);

  };

  // Does total width of all columns children of a drop row
  // allow a new column?
  isRowFull = function (dropElement, dragElement) {
    var rowWidth = $(dropElement).width();

    return rowWidth <= totalColumnsWidth(dropElement, dragElement);
  };


  LayoutView = Backbone.View.extend({
      el: $("body")

    , currentAction: null

    , initialize: function () {
      this.highlightColumns();
      this.setupDrag();
      this.setupDrop();
      this.setupResize();
      this.setupRemove();
    }

    , highlightColumns: function () {
      this.$el.on("hover", ".columns", $.proxy(function (e) {
        if (this.currentAction !== null) {
          return;
        }

        var $column = $(e.currentTarget);

        $(".columns.x-current").removeClass("x-current");
        $column.addClass("x-current")

        if ($column.children(".x-resize").length === 0) {
          $column.html(function (i, html) {
            return html + "<div class='x-resize' title='Resize element'>&harr;</div>";
          });
        }

        if ($column.children(".x-remove").length === 0) {
          $column.html(function (i, html) {
            return html + "<div class='x-remove' title='Remove element'>x</div>";
          });
        }

      }, this));
    }

    , setupDrag: function () {
      var preventDefault;

      preventDefault = function (e) {
        if (!this.isContentEditable) {
          e.preventDefault();
        }
      };

      // Links in draggable areas shouldn't be clickable
      this.$el.on("click", ".columns a", preventDefault);

      // Links and images in draggable areas shoulnd't be draggable
      this.$el.on("mousedown", ".columns a, .columns img", preventDefault);

      this.$el.on({
        draginit: $.proxy(function (e, drag) {
          this.currentAction = "drag";

          var $dragElement = $(drag.element);

          // Limit drag to first container
          drag.limit($("body").children()).revert();
        }, this)

        , dragdown: function (e, drag) {
        }

        , dragend: $.proxy(function (e, drag) {
          // Reset position
          $(drag.element).css({
            top: drag.startPosition.top() + "px",
            left: drag.startPosition.left() + "px"
          });

          this.currentAction = null;
        }, this)
      }, ".columns");
    }

    , setupDrop: function () {
      this.$el.on({
        dropover: function (e, drop, drag) {
          // Mark the row as full or not
          if (isRowFull(this, drag.element)) {
            $(this).addClass("x-full");
          } else {
            $(this).addClass("x-not-full");
          }
        }

        , dropout: function (e, drop, drag) {
          // Remove x-full or x-not-full class if previously added
          $(this).removeClass("x-full x-not-full");
        }

        , dropon: function (e, drop, drag) {
          var row, $drag, $dragParent, $dragGrandParent;

          $drag = $(drag.element);

          // Save original parent
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
      this.$el.on({
        draginit: $.proxy(function (e, drag) {
          this.currentAction = "resize";

          var $dragElement = $(drag.element);

          // Resize is done horizontally and doesn't notify drops
          drag.horizontal().only();
        }, this)

        , dragmove: function (e, drag) {
          var $column = $(this).parent()
            , $row = $column.parent()
            , $drag = $(drag.element);

          width = drag.location.x() + $drag.width() / 2 - $column.offset().left;

          // Sum of column widths should never be larger than row
          if (width >= $row.width()) {
            width = $row.width();
            e.preventDefault();
          } else if (width >= $row.width() - totalColumnsWidth($row, $column)) {
            width = $row.width() - totalColumnsWidth($row, $column);
            // When width is a float, calculation is incorrect because browsers use integers
            // The following line fixes that. Replace as soon as you find a cleaner solution
            width = width - 1
            e.preventDefault();
          }

          $column.width(width);
          drag.position(new $.Vector(width - $drag.width() / 2 + $column.offset().left, drag.location.y()));
        }

        , dragend: $.proxy(function (e, drag) {
          // Reset position
          $(drag.element).css({
              position: "absolute"
            , right: "-12px"
            , left: "auto"
          });

          this.currentAction = null;
        }, this)
      }, ".x-resize");
    }

    , setupRemove: function () {
      this.$el.on("click", ".x-remove", function () {
        if (confirm("Are you sure you want to remove this element?")) {
          $(this).parent().remove();
        }
      });
    }
  });

  return LayoutView;
});
