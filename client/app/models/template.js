// Template model class.
var Model = require("models/base/model");

module.exports = Model.extend({
    idAttribute: "_id"

  , defaults: {
      name: ""
    , template: ""
    , build: ""
    , regions: { header: "default", footer: "default" }
  }

  , setRegion: function (name, slug) {
    var regions = this.get("regions");
    regions[name] = slug;
    this.set("regions", regions);
  }
});
