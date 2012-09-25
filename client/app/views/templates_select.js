var View = require("views/base/view")
  , app = require("application")
  , Template = require("models/template")
  , template = require("views/templates/templates");

module.exports = View.extend({
    id: "x-templates-select"
  , className: "x-section"
  , template: "templates_select"
  , collection: app.editor.templates

  , data: {
    templates: app.editor.templates.map(function (template) {
      return {
          id: template.id
        , label: template.label()
        , selected: template.get("name") === "index" ? " selected='selected'" : ""
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
