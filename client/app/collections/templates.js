// Templates collection class.
var Collection = require("collections/base/collection")
  , Template = require("models/template");

module.exports = Collection.extend({
  model: Template
});
