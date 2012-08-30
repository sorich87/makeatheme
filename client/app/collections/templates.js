// Templates collection class.
var Collection = require("collections/base/collection")
  , Template = require("models/template");

module.exports = Collection.extend({
    model: Template

  // Get a template by its name
  , getTemplate: function (name) {
    return this.find(function (template) {
      return template.get("name") === name;
    });
  }
});
