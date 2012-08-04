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

        $(".columns.x-current").removeClass("x-current");
        $(e.currentTarget).addClass("x-current");
      }, this));
    }

    , setupDrag: function () {
      var preventDefault, dragPosition;

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

          dragPosition = {
              position: $dragElement.css("position")
            , top: $dragElement.css("top")
            , bottom: $dragElement.css("bottom")
            , left: $dragElement.css("left")
            , right: $dragElement.css("right")
          };

          // Limit drag to first container
          drag.limit($("body").children());
        }, this)

        , dragdown: function (e, drag) {
        }

        , dragend: $.proxy(function (e, drag) {
          // Reset position
          $(drag.element).css(dragPosition);

          this.currentAction = null;
        }, this)
      }, ".columns");
    }

    , setupDrop: function () {
      var preventDrop = function (e, drag) {
        var $drag = $(drag.element);

        if ($drag.hasClass("x-resize")) {
          return true;
        }
      };

      this.$el.on({
        dropinit: function (e, drop, drag) {
          if ( preventDrop(e, drag) ) {
            e.preventDefault();
          }
        }

        , dropover: function (e, drop, drag) {
          if ( preventDrop(e, drag) ) {
            e.preventDefault();
            return;
          }

          // Mark the row as full or not
          if (isRowFull(this, drag.element)) {
            $(this).addClass("x-full");
          } else {
            $(this).addClass("x-not-full");
          }
        }

        , dropout: function (e, drop, drag) {
          if ( preventDrop(e, drag) ) {
            e.preventDefault();
            return;
          }

          // Remove x-full or x-not-full class if previously added
          $(this).removeClass("x-full x-not-full");
        }

        , dropon: function (e, drop, drag) {
          if ( preventDrop(e, drag) ) {
            e.preventDefault();
            return;
          }

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
      var dragPosition;

      // Add resize handle
      $(".columns").html(function (i, html) {
        return html + "<div class='x-resize'>&harr;</div>";
      });

      this.$el.on({
        draginit: $.proxy(function (e, drag) {
          this.currentAction = "resize";

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
        }, this)

        , dragmove: function (e, drag) {
          var $column = $(this).parent()
            , $row = $column.parent();

          width = drag.location.x() - $column.offset().left;

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
          drag.position(new $.Vector(width + $column.offset().left, drag.location.y()));
        }

        , dragend: $.proxy(function (e, drag) {
          // Reset position
          $(drag.element).css(dragPosition);

          this.currentAction = null;
        }, this)
      }, ".x-resize");
    }

    , setupRemove: function () {
      // Add remove handle
      $(".columns").html(function (i, html) {
        return html + "<div class='x-remove'>&otimes;</div>";
      });

      this.$el.on("click", ".x-remove", function () {
        if (confirm("Are you sure you want to remove this element?")) {
          $(this).parent().remove();
        }
      });
    }
  });

  return LayoutView;
});
