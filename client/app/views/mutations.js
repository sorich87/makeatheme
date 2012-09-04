var View = require("views/base/view")
  , app = require("application")
  , idIncrement = 1; // For temporary ids when inserting rows.

module.exports = View.extend({
  initialize: function () {
    _.bindAll(this, "observeMutations", "propagateMutations");
    window.addEventListener("DOMContentLoaded", this.observeMutations);
  }

  , observeMutations: function () {
    var observer = new MutationSummary({
        rootNode: $("body")[0]
      , queries: [{all: true}]
      , callback: this.propagateMutations
    });
  }

  , propagateMutations: function (summaries) {
    var isColumn
      , summary = summaries[0];

    isColumn = function (node) {
      return node.className && node.className.indexOf("column") !== -1;
    };

    summary.added.forEach(function (node) {
      if (isColumn(node)) {
        this.addNode(node);
      }
    }.bind(this));

    summary.removed.forEach(function (node) {
      if (isColumn(node)) {
        this.removeNode(node, summary.getOldParentNode(node));
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

  , addNode: function (node) {
    var grandParentNode, region, template, row, sandbox, block, blockClassName, sibling;

    // copy of the node that will be inserted
    copy = node.cloneNode(true);

    grandParentNode = node.parentNode.parentNode;

    // If grandparent is header or footer,
    // make addition in corresponding region template
    if (["HEADER", "FOOTER"].indexOf(grandParentNode.tagName) !== -1) {
      region = app.regions.getByTypeAndName(grandParentNode.tagName.toLowerCase());

      sandbox = (new DOMParser).parseFromString(region.get("template"), "text/html");

      // Get destination row.
      row = sandbox.getElementById(node.parentNode.id);

      // If the destination node doesn't exist in the template, add it.
      if (!row) {
        row = sandbox.createElement("div");
        row.className = "row";
        row.id = "y-" + idIncrement;
        idIncrement++;

        if (node.parentNode.nextElementSibling) {
          nextRow = sandbox.getElementById(node.parentNode.nextElementSibling.id);
          nextRow.parentNode.insertBefore(row, nextRow);
        } else {
          sandbox.getElementById(grandParentNode.id).appendChild(row);
        }

        // Set the ID of the row the user sees
        node.parentNode.id = row.id
      }

      // Replace node innerHTML by Handlebars tag
      block = _(app.blocks.models).find(function (model) {
        return node.className.indexOf(model.className()) !== -1;
      });
      copy.innerHTML = block.tag();

      // Insert the tag
      if (node.nextElementSibling) {
        sibling = sandbox.getElementById(node.nextElementSibling.id);
        row.insertBefore(copy, sibling);
      } else {
        row.appendChild(copy);
      }

      region.set("template", sandbox.body.innerHTML);
    }
  }

  , removeNode: function (node, oldParentNode) {
    var oldGrandParentNode, parentNode;

    oldGrandParentNode = oldParentNode.parentNode;

    // If grandparent is header or footer, remove from corresponding region template.
    // If not, remove from template
    if (["HEADER", "FOOTER"].indexOf(oldGrandParentNode.tagName) !== -1) {
      piece = app.regions.getByTypeAndName(oldGrandParentNode.tagName.toLowerCase());
    } else {
      piece = app.templates.getCurrent();
    }

    sandbox = (new DOMParser).parseFromString(piece.get("template"), "text/html");

    parentNode = sandbox.getElementById(oldParentNode.id);

    // If parent node doesn't have anymore children, remove it
    // If not, simply remove the node
    if (oldParentNode.children.length === 0) {
      parentNode.parentNode.removeChild(parentNode);
    } else {
      parentNode.removeChild(sandbox.getElementById(node.id));
    }

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
});
