// Blocks collection class.
var Collection = require("collections/base/collection")
  , Block = require("models/block");

module.exports = Collection.extend({
    model: Block

  , getByName: function (name) {
    return this.find(function (block) {
      return block.get("name") === name;
    });
  }
});
