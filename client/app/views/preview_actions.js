var app = require("application")
  , View = require("views/base/view")
  , data = require("lib/editor_data")
  , mutations = require("lib/mutations")
  , accordion_group = require("views/templates/accordion_group")
  , copy_button = require("views/templates/copy_button");

module.exports = View.extend({
  id: "layout-editor"

  , events: {
    "click #customize-button a.copy": "askForPatience"
  }

  , render: function () {
    this.$el.empty()
      .append(app.createView("templates_select").render().$el)
      .append(copy_button({theme_id: app.data.theme._id}));

    return this;
  }

  , askForPatience: function (e) {
    e.currentTarget.setAttribute("disabled", "true");
    e.currentTarget.innerHTML = "Started the Photocopier";
  }
});
