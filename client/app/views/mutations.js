var View = require("views/base/view")
  , app = require("application")
  , idIncrement = 1; // For temporary ids when inserting rows.

module.exports = View.extend({
  initialize: function () {
    _.bindAll(this);
    window.addEventListener("DOMContentLoaded", this.observeMutations);

    app.on("template:load", this.stopObserving);
    app.on("template:loaded", this.restartObserving);

    app.on("region:load", this.stopObserving);
    app.on("region:loaded", this.restartObserving);
  }

  , stopObserving: function () {
    this.observer.disconnect();
  }

  , restartObserving: function () {
    this.observer.reconnect();
  }

  , observeMutations: function () {
    this.observer = new MutationSummary({
        rootNode: $("body")[0]
      , queries: [{all: true}]
      , callback: this.propagateMutations
    });

    this.pieces = {};

    app.trigger("mutations:started", this.pieces);
  }

  , propagateMutations: function (summaries) {
    var isColumn
      , summary = summaries[0];

    isColumn = function (node) {
      return node.className && node.className.indexOf("column") !== -1;
    };

    isRow = function (node) {
      return node.className && node.className.indexOf("row") !== -1;
    };

    summary.added.forEach(function (node) {
      if (isColumn(node)) {
        this.addNode(node, "column");
      } else if (isRow(node)) {
        this.addNode(node, "row");
      }
    }.bind(this));

    summary.removed.forEach(function (node) {
      if (isColumn(node)) {
        this.removeNode(node, summary.getOldParentNode(node), "column");
      } else if (isRow(node)) {
        this.removeNode(node, summary.getOldParentNode(node), "row");
      }
    }.bind(this));

    summary.reparented.forEach(function (node) {
      if (isColumn(node)) {
        this.reparentNode(node, summary.getOldParentNode(node));
      }
    }.bind(this));

    summary.reordered.forEach(function (node) {
      if (isColumn(node)) {
        this.reorderNode(node, summary.getOldPreviousSibling(node));
      }
    }.bind(this));
  }

  , addNode: function (node, type) {
    var topNode, region, template, parentNode, sandbox, block, sibling, templateClone;

    copy = node.cloneNode(false);

    if (type === "column") {
      topNode = node.parentNode.parentNode;

      // Add corresponding Liquid tag in column node.
      for (var i in this.pieces.blocks.models) {
        block = this.pieces.blocks.models[i];

        if (node.className.indexOf(block.className()) !== -1) {
          copy.innerHTML = block.tag();
          break;
        }
      }
    } else {
      topNode = node.parentNode;
    }

    piece = this.getTemplatePiece(topNode);

    sandbox = (new DOMParser).parseFromString(piece.get("template"), "text/html");

    // Get destination row.
    parentNode = sandbox.getElementById(node.parentNode.id);

    // Insert the node in the row
    if (node.nextElementSibling) {
      sibling = sandbox.getElementById(node.nextElementSibling.id);
      parentNode.insertBefore(copy, sibling);
    } else {
      parentNode.appendChild(copy);
    }

    piece.set("template", sandbox.body.innerHTML);
  }

  , removeNode: function (node, oldParentNode, type) {
    var topNode, parentNode;

    if (type === "column") {
      topNode = oldParentNode.parentNode;

      // If no topNode, it means the parent row has been removed as well.
      if (topNode === null) {
        return;
      }
    } else if (type === "row") {
      topNode = oldParentNode;
    }

    piece = this.getTemplatePiece(topNode);

    sandbox = (new DOMParser).parseFromString(piece.get("template"), "text/html");

    parentNode = sandbox.getElementById(oldParentNode.id);

    parentNode.removeChild(sandbox.getElementById(node.id));

    piece.set("template", sandbox.body.innerHTML);
  }

  , reparentNode: function (node, oldParentNode) {
    this.addNode(node);
    // Remove node if it was in a different region
    if (oldParentNode.parentNode !== null) {
      this.removeNode(node, oldParentNode);
    }
  }

  , reorderNode: function (node, oldPreviousSibling) {
    this.addNode(node);
  }

  , getTemplatePiece: function(topNode) {
    var piece;

    if (["HEADER", "FOOTER"].indexOf(topNode.tagName) !== -1) {
      piece = this.pieces.regions.getByName(topNode.tagName.toLowerCase());

      piece.set("build", topNode.outerHTML);
    } else {
      piece = this.pieces.templates.getCurrent();

      templateClone = window.document.getElementById("page").cloneNode(true);
      $(templateClone).children("header, footer").remove();
      piece.set("build", templateClone.innerHTML);
    }

    return piece;
  }
});
