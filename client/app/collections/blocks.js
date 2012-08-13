// Blocks collection class.
var Collection = require("collections/base/collection")
  , Block = require("models/block");

module.exports = Collection.extend({
  model: Block
});
