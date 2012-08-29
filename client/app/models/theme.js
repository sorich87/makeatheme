// Theme model class.
var Model = require("models/base/model");

module.exports = Model.extend({
    idAttribute: "_id"

  , defaults: {
      name: ""
    , author: ""
    , screenshot_uri: ""
  }
});
