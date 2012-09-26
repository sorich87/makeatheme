// Block model class.
var Model = require("models/base/model");

module.exports = Model.extend({
    idAttribute: "_id"

  , defaults: {
      name: ""
    , template: ""
    , build: ""
  }

  , label: function () {
    return _.str.titleize(this.get("label") + " " + _.str.humanize(this.get("name")));
  }

  , className: function () {
    return this.get("name").replace("_", "-");
  }

  // Return block Liquid tag
  , tag: function () {
    return "{{" + this.get("name") + "}}";
  }
});
