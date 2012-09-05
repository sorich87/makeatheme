// Themes collection class.
var Collection = require("collections/base/collection")
  , Theme = require("models/theme");

module.exports = Collection.extend({
    model: Theme
  , url: "/themes"
});
