var app = require("application"),
    View = require("views/base/view"),
    template = require("views/templates/account"),
    User = require("models/user");

module.exports = View.extend({
  template: "account",
  model: _.clone(app.currentUser),

  events: {
    "submit form": "editUser",
    "change .error input": "clearError"
  },

  initialize: function () {
    Backbone.Validation.bind(this);
  },

  render: function () {
    this.$el.empty().append(template(this.model.toJSON()));

    return this;
  },

  editUser: function (e) {
    var attrs = {};

    e.preventDefault();

    this.$("input").each(function () {
      attrs[this.getAttribute("name")] = this.value;
    });

    this.$("button[type=submit]").get(0).setAttribute("disabled", "true");

    this.model.save(attrs, {
      success: function (model, res) {
        app.currentUser.set(res);

        this.$("button[type=submit]").get(0).removeAttribute("disabled");

        app.trigger("user:edit", app.currentUser);
        app.trigger("notification", "success", "Changes to your account have been saved.");
      }.bind(this)

      , error: function (model, err) {
        this.$("button[type=submit]").get(0).removeAttribute("disabled");

        this.displayServerErrors(err);
      }.bind(this)
    });
  },

  displayServerErrors: function (err) {
    if (! err.responseText) {
      return;
    }

    var msgs = JSON.parse(err.responseText);

    Object.keys(msgs).forEach(function (attr) {
      var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " " + msgs[attr][0];
      Backbone.Validation.callbacks.invalid(this, attr, msg, "name");
    }.bind(this));
  },

  clearError: function (e) {
    $(e.currentTarget).closest(".error")
      .removeClass("error")
      .find(".error-message").remove();
  }
});

