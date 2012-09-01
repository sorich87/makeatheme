// Regions collection class.
var Collection = require("collections/base/collection")
  , Region = require("models/region");

module.exports = Collection.extend({
    model: Region

  // Get region by type and name. Use "default" if name not specified.
  , getByTypeAndName: function (type, name) {
    if (name === void 0) {
      name = "default";
    }

    return this.find(function (region) {
      return region.get("type") === type && region.get("name") === name;
    });
  }
});
