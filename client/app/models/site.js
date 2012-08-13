// Site model class.
var Model = require("models/base/model");

module.exports = Model.extend({
  defaults: {
      title: "Your Site Name"
    , description: "Just another WordPress site"
    , home_url: "#"
    , site_url: "#"
  }
});
