// Region model class.
var Model = require("models/base/model");

module.exports = Model.extend({
    idAttribute: "_id"

  , defaults: {
      slug: ""
    , name: ""
    , template: ""
  }

  , validate: function (attrs) {
    if (["header", "footer"].indexOf(attrs.name) < 0) {
      return "Region must be header or footer.";
    }
  }
});
