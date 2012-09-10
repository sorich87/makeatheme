// Regions collection class.
var Collection = require("collections/base/collection")
  , Region = require("models/region");

module.exports = Collection.extend({
    model: Region

  // Get region by name. Use "default" if slug not specified.
  , getByName: function (name, slug) {
    if (slug === void 0) {
      slug = "default";
    }

    return this.find(function (region) {
      return region.get("slug") === slug && region.get("name") === name;
    });
  }
});
