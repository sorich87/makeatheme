var View = require("views/base/view"),
    app = require("application"),
    template = require("views/templates/new_region");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown",

  render: function () {
    var name = this.options.name,
        formView;

    formView = app.createView("new_region_form", {
      name: name
    }).render();

    this.subViews.push(formView);

    this.$el.empty().append(template({
      name: name,
      label: name === "header" ? "Header" : "Footer"
    }));

    return this;
  }
});
