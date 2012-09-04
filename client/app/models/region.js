// Region model class.
var Model = require("models/base/model");

module.exports = Model.extend({
  defaults: {
      type: ""
    , name: ""
    , template: ""
  }

  , validate: function (attrs) {
    if (["header", "footer"].indexOf(attrs.type) < 0) {
      return "Region type must be header or footer.";
    }
  }
});
