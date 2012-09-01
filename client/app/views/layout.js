var totalColumnsWidth, isRowFull
  , View = require("views/base/view");

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

module.exports = View.extend({
    el: $("body")

  , currentAction: null

  , events: {
      // Highlight columns.
      "hover .columns": "highlightColumns"

      // Links in columns shouldn't be clickable.
    , "click .columns a": "preventDefault"

      // Links and images in columns shoulnd't be draggable
    , "mousedown .columns a, .columns img": "preventDefault"

      // Drag
    , "draginit .columns": "dragInit"
    , "dragend .columns": "dragEnd"

      // Drop
    , "dropover .row": "dropOver"
    , "dropout .row": "dropOut"
    , "dropon .row": "dropOn"

      // Resize
    , "draginit .x-resize": "resizeInit"
    , "dragmove .x-resize": "resizeMove"
    , "dragend .x-resize": "resizeEnd"

      // Remove column
    , "click .x-remove": "removeColumn"
  }

  , preventDefault: function (e) {
    e.preventDefault();
  }

  // Remove .x-current from previously highlighted column and add to current one.
  // Add resize and delete handles to the column if they weren't there already.
  , highlightColumns: function (e) {
    if (this.currentAction !== null) {
      return;
    }

    var $column = $(e.currentTarget);

    this.$(".columns.x-current").removeClass("x-current");
    $column.addClass("x-current")

    if ($column.children(".x-resize").length === 0) {
      $column.html(function (i, html) {
        return html + "<div class='x-resize' title='Resize element'>&harr;</div>";
      });
    }

    if ($column.children(".x-remove").length === 0) {
      $column.html(function (i, html) {
        return html + "<div class='x-remove' title='Remove element'>&times;</div>";
      });
    }

  }

  // Start drag and limit it to direct children of body.
  // If released, revert to original position.
  , dragInit: function (e, drag) {
    this.currentAction = "drag";

    drag.limit(this.$el.children()).revert();
  }

  // Reset position of dragged element.
  , dragEnd: function (e, drag) {
    $(drag.element).css({
      top: drag.startPosition.top() + "px",
      left: drag.startPosition.left() + "px"
    });

    this.currentAction = null;
  }

  // Mark the row as full or not.
  , dropOver: function (e, drop, drag) {
    $(drop.element).addClass(function () {
      if (isRowFull(this, drag.element)) {
        $(this).addClass("x-full");
      } else {
        $(this).addClass("x-not-full");
      }
    });
  }

  // Remove x-full or x-not-full class if previously added.
  , dropOut: function (e, drop, drag) {
    $(drop.element).removeClass("x-full x-not-full");
  }

  // Add column to row. If the row is full, add a new row.
  // If original parent row doesn't have any more children
  // and is not a <header> or <footer> and has no id attribute, remove it.
  // Remove x-full and x-not-full classes if one was previously added.
  , dropOn: function (e, drop, drag) {
    var row, $drag, $dragParent, $dragGrandParent;

    $drag = $(drag.element);
    $drop = $(drop.element);

    $dragParent = $drag.parent();

    if (isRowFull($drop, $drag)) {
      $row = $("<div class='row'></div>").insertAfter($drop);
    } else {
      $row = $drop;
    }
    $drag.appendTo($row);

    $drop.removeClass("x-empty");

    if ($dragParent.children().length === 0 ) {
      $dragGrandParent = $dragParent.parent();

      if (($dragGrandParent.is("header, footer") && $dragGrandParent.children().length === 1)
          && $dragParent.attr("id").indexOf("x-") !== 0) {
        $dragParent.addClass("x-empty");
      } else {
        $dragParent.remove();
      }
    }

    $drop.removeClass("x-full x-not-full");
  }

  // Init drag of resize handle horizontally and don't notify drops.
  , resizeInit: function (e, drag) {
    this.currentAction = "resize";

    drag.horizontal().only();
  }

  // Resize the column.
  // Sum of column widths in the row should never be larger than row.
  , resizeMove: function (e, drag) {
    var $drag = $(drag.element)
    , $column = $drag.parent()
    , $row = $column.parent();

    width = drag.location.x() + $drag.width() / 2 - $column.offset().left;

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

  // Reset position of resize handle
  , resizeEnd: function (e, drag) {
    $(drag.element).css({
      position: "absolute"
      , right: "-12px"
      , left: "auto"
    });

    this.currentAction = null;
  }

  // Remove column if confirmed.
  , removeColumn: function (e) {
    if (confirm("Are you sure you want to remove this element?")) {
      $(e.currentTarget).parent().remove();
    }
  }
});
