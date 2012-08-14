// Block model class.
var Model = require("models/base/model");

module.exports = Model.extend({
  defaults: {
      name: ""
    , filename: ""
  }
});
