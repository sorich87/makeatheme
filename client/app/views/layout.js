var totalColumnsWidth, isRowFull
  , View = require("views/base/view")
  , app = require("application")
  , idIncrement = 1;

// Return total width of all columns children of a row
// except the one being dragged
totalColumnsWidth = function (dropElement, dragElement) {
  return _.reduce($(dropElement).children(), function (memo, child) {
    if (child === dragElement) {
      return memo;
    } else {
      return memo + $(child).outerWidth(true);
    }
  }, 0);

};

// Does total width of all columns children of a drop row
// allow a new column?
isRowFull = function (dropElement, dragElement) {
  return $(dropElement).children().length > 0 &&
    $(dropElement).width() < totalColumnsWidth(dropElement, dragElement) + $(dragElement).width();
};

module.exports = View.extend({
    el: $("body")

  , events: {
      // Highlight columns.
      "click .column": "highlightColumns"

      // Remove column
    , "click .column .x-remove": "removeColumn"

    , "mouseenter .column": "makeDraggable"

    , "mouseenter .row": "makeDroppable"

    , "mouseenter .x-resize": "makeResizeable"
  }

  , appEvents: {
    "region:loaded": "highlightEmpty",
    "template:loaded": "highlightEmpty"
  }

  , initialize: function () {
    this.$el.addClass("editing");
    this.makeDroppable();

    View.prototype.initialize.call(this);
  }

  , highlightEmpty: function () {
    this.$(".row").each(function (i, row) {
      var $row = $(row);

      if ($row.children().length === 0) {
        $row.addClass("x-empty");
      }
    });
  }

  , makeDraggable: function (e) {
    this.$(".column").draggable({
        addClasses: false
      , revert: "invalid"
      , drag: this.dragOn
      , start: this.dragStart
      , stop: this.dragStop
      , zIndex: 99999
    });
  }

  , makeDroppable: function (e) {
    this.$(".row").droppable({
        accept: ".column, .x-drag"
      , addClasses: false
      , drop: this.dropOn.bind(this)
      , out: this.dropOut
      , over: this.dropOver
    });
  }

  , makeResizeable: function (e) {
    $(e.currentTarget).draggable({
        addClasses: false
      , axis: "x"
      , containment: this.$el.children()
      , drag: this.resizeOn
      , stop: this.resizeStop
    });
  }

  // Remove .x-current from previously highlighted column and add to current one.
  // Add resize and delete handles to the column if they weren't there already.
  , highlightColumns: function (e) {
    var $column, name, slug;

    app.trigger("column:highlight", e.currentTarget);

    $column = $(e.currentTarget);

    this.$(".x-current").removeClass("x-current");
    $column.addClass("x-current");

    if ($column.children(".x-resize").length === 0) {
      $column.html(function (i, html) {
        return html + "<div class='x-resize' title='Resize element'>&rang;</div>";
      });
    }

    if ($column.children(".x-remove").length === 0) {
      $column.html(function (i, html) {
        return html + "<div class='x-remove' title='Remove element'>&times;</div>";
      });
    }

    if ($column.children(".x-name").length === 0) {
      name = $column.children(":first").data("x-name");
      label = $column.children(":first").data("x-label");

      if (!name || !label) {
        return;
      }

      label = _.str.titleize(label + " " + _.str.humanize(name));

      $column.html(function (i, html) {
        return html + "<div class='x-name'>" + label + "</div>";
      });
    }
  }

  , dragStart: function (e, ui) {
    if ($.browser.msie || $.browser.mozilla) {
      $(this).data("start-scroll", $("html").scrollTop());
    } else {
      $(this).data("start-scroll", $("body").scrollTop());
    }
    app.trigger("node:removed", ui.helper[0], ui.helper[0].parentNode);
  }

  , dragOn: function(e, ui) {
    var sc = parseInt($(this).data("start-scroll"), 10);
    if ($.browser.msie || $.browser.mozilla) {
      ui.position.top -= $("html").scrollTop() - sc;
    } else {
      ui.position.top -= $("body").scrollTop() - sc;
    }
  }

  // Reset position of dragged element.
  , dragStop: function (e, ui) {
    ui.helper.removeAttr("style");

    app.trigger("node:added", ui.helper[0]);
  }

  // Mark the row as full or not.
  , dropOver: function (e, ui) {
    $(this).addClass(function () {
      if (isRowFull(this, ui.draggable.get(0))) {
        $(this).addClass("x-full");
      } else {
        $(this).addClass("x-not-full");
      }
    });
  }

  // Remove x-full or x-not-full class if previously added.
  , dropOut: function (e, ui) {
    $(this).removeClass("x-full x-not-full");
  }

  // Add column to row. If the row is full, add a new row.
  // If original parent row doesn't have any more children
  // and is not a <header> or <footer> and has no id attribute, remove it.
  // Remove x-full and x-not-full classes if one was previously added.
  , dropOn: function (e, ui) {
    var row, $drag, $dragParent, $dragGrandParent;

    $drag = ui.helper;
    $drop = $(e.target);

    $dragParent = $drag.parent();

    if (isRowFull(e.target, ui.helper.get(0))) {
      $row = $("<div class='row' id='y-" + idIncrement + "'></div>").insertAfter($drop);
      idIncrement++;
      app.trigger("node:added", $row[0], "row");
    } else {
      $row = $drop;
    }
    $drag.appendTo($row);

    $drop.removeClass("x-empty x-full x-not-full");

    if ($drag.data("cid")) {
      app.trigger("block:inserted", $drag[0], "y-" + idIncrement);
      idIncrement++;
    } else if ($dragParent.children().length === 0) {
      this.maybeRemoveRow($dragParent.get(0));
    }
  }

  // Resize the column.
  // Sum of column widths in the row should never be larger than row.
  , resizeOn: function (e, ui) {
    var $column = ui.helper.parent()
    , $row = $column.parent();

    width = ui.position.left + 12;

    if (width >= $row.width()) {
      width = $row.width();
    } else if (width >= $row.width() - totalColumnsWidth($row.get(0), $column.get(0))) {
      width = $row.width() - totalColumnsWidth($row.get(0), $column.get(0));
      // When width is a float, calculation is incorrect because browsers use integers
      // The following line fixes that. Replace as soon as you find a cleaner solution
      width = width - 1;
    }

    $column.attr("style", "width: " + width + "px");
  }

  // Reset position of resize handle
  , resizeStop: function (e, ui) {
    var $drag = ui.helper
      , $column = $drag.parent();

    app.trigger("resize:end", "#page #" + $column[0].id, $column[0].style.width);

    $drag.removeAttr("style");
    $column.removeAttr("style");
  }

  // Remove column if confirmed.
  // Remove the whole row if it would be empty.
  , removeColumn: function (e) {
    var nodeToRemove, type, parentNodeId
      , grandParentNode = e.currentTarget.parentNode.parentNode;

    if (!confirm("Are you sure you want to remove this element?")) {
      return;
    }

    nodeToRemove = e.currentTarget.parentNode;
    parentNodeId = nodeToRemove.parentNode.id;

    nodeToRemove.parentNode.removeChild(nodeToRemove);

    app.trigger("node:removed", nodeToRemove,
                window.document.getElementById(parentNodeId), "column");

    if (grandParentNode.children.length === 0) {
      this.maybeRemoveRow(grandParentNode);
    }
  }

  // Check if a row is the last one in the header or footer
  // or has a custom ID before removing it.
  , maybeRemoveRow: function (node) {
    var parent = node.parentNode
      , parentId = parent.id;

    if (parent.children.length === 1 ||
        (node.id.indexOf("x-") !== 0 && node.id.indexOf("y-") !== 0)) {
      node.className += " x-empty";
    } else {
      parent.removeChild(node);

      app.trigger("node:removed", node,
                  window.document.getElementById(parentId), "row");
    }
  }
});
