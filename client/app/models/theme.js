// Theme model class.
var Model = require("models/base/model");

module.exports = Model.extend({
    idAttribute: "_id"
  , urlRoot: "/themes"

  , defaults: {
      name: ""
    , author: ""
    , screenshot_uri: ""
  }
});
