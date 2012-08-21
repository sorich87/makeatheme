var View = require("views/base/view");

module.exports = View.extend({
    template: "register"

  , events: {
      "click .submit": "createUser"
    , "change input[type=text]": "removeError"
  }

  , initialize: function () {
    Backbone.Validation.bind(this);
  }

  // Create current user from form input values and submit to the server.
  // Display error messages in the form.
  // Hide modal on success.
  , createUser: function (e) {
    e.preventDefault();

    var user = this.model
      , attrs = {};

    this.$("input").each(function () {
      attrs[this.getAttribute("name")] = this.value;
    });

    user.save(attrs, {
      success: function (model, err) {
        this.$el.modal("hide");
      }.bind(this)

      , error: function (model, err) {
        if (err.hasOwnProperty("readyState")) {
          // Handle validation error messages from server.
          this.addErrors(JSON.parse(err.responseText));
        } else {
          // Handle validation error messages from client.
          this.addErrors(err);
        }
      }.bind(this)
    });
  }

  // Display errors in the form.
  , addErrors: function (errors) {
    Object.keys(errors).forEach(function (attr) {
      var msg = errors[attr];

      // When coming from server, messages are in an array,
      // just display the first one.
      msg = Array.isArray(msg) ? msg[0] : msg;

      this.$("input[name='" + attr + "']")
        .after("<span class='help-block'>" + msg + "</span>")
        .closest(".control-group").addClass("error");
    });
  }

  // Remove error message from a field.
  , removeError: function (e) {
    $(e.target)
      .next(".help-block").remove().end()
      .closest(".control-group").removeClass("error");
  }
});
