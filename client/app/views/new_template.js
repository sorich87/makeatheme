var View = require("views/base/view"),
    app = require("application"),
    template = require("views/templates/new_template");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown",

  render: function () {
    var formView = app.createView("new_template_form").render();

    this.subViews.push(formView);

    this.$el.empty().append(template());

    return this;
  }
});
