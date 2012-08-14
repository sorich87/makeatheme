var View = require("views/base/view")
  , template = require("views/templates/theme");

module.exports = View.extend({
  render: function () {
    this.setElement(template());

    $("body").addClass("theme");

    // Remove body class when navigating away from this view
    Backbone.history.on("route", function (e, name) {
      if (name !== "theme") {
        $("body").removeClass("theme");
      }
    });

    return this;
  }
});
