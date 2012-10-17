var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
  initialize: function () {
    app.on("node:added", this.addNode.bind(this));
    app.on("node:removed", this.removeNode.bind(this));

    this.pieces = {};
    app.trigger("mutations:started", this.pieces);
  }

  , addNode: function (node, type) {
    var topNode, region, template, parentNode, sandbox, block, sibling, templateClone;

    copy = node.cloneNode(true);

    if (type === "row") {
      topNode = node.parentNode;
    } else {
      topNode = node.parentNode.parentNode;

      // Add corresponding Liquid tag in column node.
      for (var i in this.pieces.blocks.models) {
        block = this.pieces.blocks.models[i];

        if (node.firstElementChild.getAttribute("data-x-name") === block.get("name") &&
            node.firstElementChild.getAttribute("data-x-label") === block.get("label")) {
          copy.innerHTML = block.tag();
          break;
        }
      }
    }

    piece = this.getTemplatePiece(topNode);

    sandbox = (new DOMParser()).parseFromString(piece.get("template"), "text/html");

    // Get parent destination.
    parentNode = sandbox.getElementById(node.parentNode.id);

    this.cleanupNode(copy);

    // Insert the node in the template.
    // If the next sibling of the node is the footer region,
    // insert the node at the end.
    if (node.nextElementSibling) {
      if ("FOOTER" === node.nextElementSibling.tagName) {
        sandbox.body.innerHTML = sandbox.body.innerHTML + copy.outerHTML;
      } else {
        nextNode = sandbox.getElementById(node.nextElementSibling.id);
        if (nextNode.parentNode) {
          nextNode.parentNode.insertBefore(copy, nextNode);
        }
      }
    } else {
      sandbox.getElementById(node.parentNode.id).appendChild(copy);
    }

    piece.set("template", sandbox.body.innerHTML);
  }

  , removeNode: function (node, oldParentNode, type) {
    var topNode;

    if (type === "row") {
      topNode = oldParentNode;
    } else {
      topNode = oldParentNode.parentNode;

      // If no topNode, it means the parent row has been removed as well.
      if (topNode === null) {
        return;
      }
    }

    piece = this.getTemplatePiece(topNode);

    sandbox = (new DOMParser()).parseFromString(piece.get("template"), "text/html");

    copy = sandbox.getElementById(node.id);

    copy.parentNode.removeChild(copy);

    piece.set("template", sandbox.body.innerHTML);
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

  , cleanupNode: function(node) {
    $(node)
      .removeClass("x-current x-full x-not-full x-empty")
      .children(".x-resize, .x-remove")
        .remove()
        .end()
      .find("a[data-bypass=true]")
        .removeAttr("data-bypass");
  }
});
