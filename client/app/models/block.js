// Block model class.
var Model = require("models/base/model");

module.exports = Model.extend({
  defaults: {
      name: ""
    , template: ""
    , build: ""
  }

  , label: function () {
    return _.str.humanize(this.get("name"));
  }

  , className: function () {
    return this.get("name").replace("_", "-");
  }

  // Return block Handlebars tag
  , tag: function () {
    return "{{ " + this.get("name") + " }}";
  }
});
