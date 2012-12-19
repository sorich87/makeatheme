var View = require("views/base/view")
  , app = require("application")
  , Template = require("models/template")
  , template = require("views/templates/templates");

module.exports = View.extend({
    id: "templates-preview"
  , className: "x-section"
  , template: "templates_select"
  , collection: app.editor.templates

  , initialize: function () {
    var template = this.collection.getCurrent();

    $("#page").fadeOut().empty()
      .append(template.get("full"))
      .fadeIn();

    View.prototype.initialize.call(this);
  }

  , data: {
    templates: app.editor.templates.map(function (template) {
      return {
          id: template.id
        , label: template.label()
        , name: template.get("name")
      };
    })
  }

  , events: {
    "change select": "switchTemplate"
  }

  , switchTemplate: function () {
    var template = this.collection.get(this.$("select").val());

    $("#page").fadeOut().empty()
      .append(template.get("full"))
      .fadeIn();
  }
});
