// Region model class.
var Model = require("models/base/model");

module.exports = Model.extend({
    defaults: {
        type: ""
      , name: ""
  }

  , validate: function (attrs) {
    if (["header", "footer", "content", "sidebar"].indexOf(attrs.type) < 0) {
      return "Region type must be header, footer, content or sidebar.";
    }
  }
});
