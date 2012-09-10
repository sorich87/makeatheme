// Regions collection class.
var Collection = require("collections/base/collection")
  , Region = require("models/region");

module.exports = Collection.extend({
    model: Region

  // Get region by name. Use "default" if slug not specified.
  , getByName: function (name, slug) {
    var func;

    if (slug === void 0) {
      slug = "default";
      func = "filter";
    } else {
      func = "find";
    }

    return this[func](function (region) {
      return region.get("slug") === slug && region.get("name") === name;
    });
  }
});
