var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    className: "modal"
  , template: "password_reset"
  , model: app.currentUser

  , events: {
    "submit form": "initiatePasswordReset"
  }

  , initiatePasswordReset: function (e) {
    e.preventDefault();

    if (this.validateInputs()) {
      this.initiateReset();
    }
  }

  , validateInputs: function () {
    var valid = true;

    this.$("form input").each(function (i, element) {
      var attr = element.getAttribute("name");

      if (element.value === "") {
        var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " can't be blank";
        Backbone.Validation.callbacks.invalid(this, attr, msg, "name");

        valid = false;
      }
    }.bind(this));

    return valid;
  }

  , initiateReset: function () {
    var data = {
        email: this.$("input[name=email]")[0].value
      , password: this.$("input[name=password]")[0].value
    };

    $.ajax({
        contentType: "application/json;charset=UTF-8"
      , dataType: "json"
      , type: "POST"
      , url: "/users/reset_password"
      , data: JSON.stringify(data)
      , complete: function (jqXHR, textStatus) {
        switch (textStatus) {
          case "success":
            this.$el.modal("hide");

            app.trigger("notification", "success", "We have sent you an email with a link to confirm your new password.");
          break;

          case "error":
          break;
        }
      }.bind(this)
    });
  }
});
