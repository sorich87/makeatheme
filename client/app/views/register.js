var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    className: "modal"
  , template: "register"
  , model: app.currentUser
  , validateModel: true

  , events: {
    "submit form": "createUser",
    "change .error input": "clearError"
  }

  // Create current user from form input values and submit to the server.
  // Handle error messages from server.
  , createUser: function (e) {
    e.preventDefault();

    var user = this.model
      , attrs = {};

    this.$("input").each(function () {
      attrs[this.getAttribute("name")] = this.value;
    });

    this.$("button[type=submit]").get(0).setAttribute("disabled", "true");

    user.save(attrs, {
      success: function (model, res) {
        model.set(res);

        app.trigger("registration", model);
        app.trigger("notification", "success", "Your registration was successful. You are now logged in.");
      }.bind(this)

      , error: function (model, err) {
        this.$("button[type=submit]").get(0).removeAttribute("disabled");

        this.displayServerErrors(err);
      }.bind(this)
    });
  }

  , displayServerErrors: function (err) {
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
