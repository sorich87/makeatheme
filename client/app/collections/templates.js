// Templates collection class.
var Collection = require("collections/base/collection")
  , Template = require("models/template");

module.exports = Collection.extend({
    model: Template

  // Get a template by its name
  , getByName: function (name) {
    return this.find(function (template) {
      return template.get("name") === name;
    });
  }

  // Get template being edited
  , getCurrent: function () {
    return this.find(function (template) {
      return template.get("current") === true;
    });
  }

  // Save template being edited
  , setCurrent: function (template) {
    var oldCurrent;
    if (oldCurrent = this.getCurrent()) {
      oldCurrent.set("current", false);
    }

    template.set("current", true);
  }
});
