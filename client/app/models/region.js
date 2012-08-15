// Region model class.
var Model = require("models/base/model");

module.exports = Model.extend({
  defaults: {
      type: "sidebar"
    , name: ""
    , template: ""
  }

  , validate: function (attrs) {
    if (["header", "footer", "content", "sidebar"].indexOf(attrs.type) < 0) {
      return "Region type must be header, footer, content or sidebar.";
    }
  }
});
