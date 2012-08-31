var View = require("views/base/view");

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
  }

  , removeNode: function (node, oldParentNode) {
  }

  , reparentNode: function (node, oldParentNode) {
  }

  , reorderNode: function (node, oldPreviousSibling) {
  }
});
