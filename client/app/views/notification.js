var View = require("views/base/view")
  , template = require("views/templates/notification");

module.exports = View.extend({
    className: "alert notification"

  , render: function () {
    this.$el.append(template({text: this.options.text}))
      .addClass("alert-" + this.options.type);

    return this;
  }
});
