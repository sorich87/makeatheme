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
    var current = this.find(function (template) {
      return template.get("current") === true;
    });

    if (!current) {
      current = this.getByName("index");
    }

    return current;
  }

  // Save template being edited
  , setCurrent: function (template) {
    var oldCurrent= this.getCurrent();

    if (oldCurrent) {
      oldCurrent.set("current", false);
    }

    template.set("current", true);
  }
});
