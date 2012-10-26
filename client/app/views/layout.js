var totalColumnsWidth, isRowFull
  , View = require("views/base/view")
  , app = require("application")
  , idIncrement = 1;

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
  return $(dropElement).width() <= totalColumnsWidth(dropElement, dragElement) + $(dragElement).width();
};

module.exports = View.extend({
    el: $("body")

  , events: {
      // Highlight columns.
      "click .columns": "highlightColumns"

      // Links in columns shouldn't be clickable.
    , "click .columns a": "preventDefault"

      // Links and images in columns shoulnd't be draggable
    , "mousedown .columns a, .columns img": "preventDefault"

      // Forms shouldn't be submittable
    , "submit .columns form": "preventDefault"

      // Remove column
    , "click .columns .x-remove": "removeColumn"

    , "mouseover .column, .columns": "makeDraggable"

    , "mouseover .row": "makeDroppable"

    , "mouseover .x-resize": "makeResizeable"
  }

  , initialize: function () {
    // Add data-bypass attribute to links so that navigation is not triggered
    // when clicked on
    this.addDataBypass();
    _.bindAll(this, "addDataBypass", "removeDataBypass");
    app.on("save:before", this.removeDataBypass);
    app.on("save:after", this.addDataBypass);
    app.on("save:error", this.addDataBypass);
    app.on("template:loaded", this.addDataBypass);

    this.makeDroppable();
  }

  , makeDraggable: function (e) {
    this.$(".column, .columns").draggable({
        addClasses: false
      , containment: this.$el.children()
      , revert: "invalid"
      , drag: this.dragOn
      , start: this.dragStart
      , stop: this.dragStop
      , zIndex: 99999
    });
  }

  , makeDroppable: function (e) {
    this.$(".row").droppable({
        accept: ".column, .columns, .x-drag"
      , addClasses: false
      , drop: this.dropOn
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

  , removeDataBypass: function () {
    this.$(".columns a").removeAttr("data-bypass");
  }

  , addDataBypass: function () {
    this.$(".columns a").attr("data-bypass", true);
  }

  , preventDefault: function (e) {
    e.preventDefault();
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
      if (isRowFull(this, ui.draggable)) {
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
    $drop = $(this);

    $dragParent = $drag.parent();

    if (isRowFull($drop, $drag)) {
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
    } else {
      if ($dragParent.children().length === 0) {
        $dragGrandParent = $dragParent.parent();

        if (($dragGrandParent.is("header, footer") && $dragGrandParent.children().length === 1) &&
            $dragParent.attr("id").indexOf("x-") !== 0) {
          $dragParent.addClass("x-empty");
        } else {
          $dragParent.remove();
          app.trigger("node:removed", $dragParent[0], $dragGrandParent[0], "row");
        }
      }
    }
  }

  // Resize the column.
  // Sum of column widths in the row should never be larger than row.
  , resizeOn: function (e, ui) {
    var $drag = ui.helper
    , $column = $drag.parent()
    , $row = $column.parent();

    width = ui.position.left + $drag.width();

    if (width >= $row.width()) {
      width = $row.width();
    } else if (width >= $row.width() - totalColumnsWidth($row, $column)) {
      width = $row.width() - totalColumnsWidth($row, $column);
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

    app.trigger("resize:end", "#" + $column[0].id, $column[0].style.width);

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

    if (grandParentNode.children.length === 1) {
      type = "row";
      nodeToRemove = grandParentNode;
    } else {
      type = "column";
      nodeToRemove = e.currentTarget.parentNode;
    }

    parentNodeId = nodeToRemove.parentNode.id;

    nodeToRemove.parentNode.removeChild(nodeToRemove);

    app.trigger("node:removed", nodeToRemove, window.document.getElementById(parentNodeId), type);
  }
});
