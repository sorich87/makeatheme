// Block model class.
var Model = require("models/base/model");

module.exports = Model.extend({
  defaults: {
      name: ""
    , template: ""
    , build: ""
  }

  , label: function () {
    return this.get("name").replace("_", " ")
      .replace(/(?:^|\s)\S/g, function (c) { return c.toUpperCase(); });
  }

  , className: function () {
    return this.get("name").replace("_", "-");
  }

  // Return block Handlebars tag
  , tag: function () {
    return "{{ " + this.get("name") + " }}";
  }
});
