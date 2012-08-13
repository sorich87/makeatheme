// Regions collection class.
var Collection = require("collections/base/collection")
  , Region = require("models/region");

module.exports = Collection.extend({
  model: Region
});
