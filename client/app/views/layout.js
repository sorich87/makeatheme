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

  , highlightColumns: function (e) {
    if (this.currentAction !== null) {
      return;
    }

    var $column = $(e.target);

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

  , dragInit: function (e, drag) {
    this.currentAction = "drag";

    // Limit drag to first container
    drag.limit($("body").children()).revert();
  }

  , dragEnd: function (e, drag) {
    // Reset position
    $(drag.element).css({
      top: drag.startPosition.top() + "px",
      left: drag.startPosition.left() + "px"
    });

    this.currentAction = null;
  }

  , dropOver: function (e, drop, drag) {
    // Mark the row as full or not
    if (isRowFull(e.target, drag.element)) {
      $(e.target).addClass("x-full");
    } else {
      $(e.target).addClass("x-not-full");
    }
  }

  , dropOut: function (e, drop, drag) {
    // Remove x-full or x-not-full class if previously added
    $(e.target).removeClass("x-full x-not-full");
  }

  , dropOn: function (e, drop, drag) {
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

    $(e.target).removeClass("x-empty");

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
    $(e.target).removeClass("x-full x-not-full");
  }

  , resizeInit: function (e, drag) {
    this.currentAction = "resize";

    // Resize is done horizontally and doesn't notify drops
    drag.horizontal().only();
  }

  , resizeMove: function (e, drag) {
    var $drag = $(drag.element)
    , $column = $drag.parent()
    , $row = $column.parent();

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

  , resizeEnd: function (e, drag) {
    // Reset position
    $(drag.element).css({
      position: "absolute"
      , right: "-12px"
      , left: "auto"
    });

    this.currentAction = null;
  }

  , removeColumn: function (e) {
    if (confirm("Are you sure you want to remove this element?")) {
      $(e.target).parent().remove();
    }
  }
});
