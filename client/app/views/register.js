var View = require("views/base/view");

module.exports = View.extend({
    className: "modal"

  , template: "register"

  , events: {
    "click .submit": "createUser"
  }

  , initialize: function () {
    Backbone.Validation.bind(this);
  }

  // Create current user from form input values and submit to the server.
  // Handle error messages from server.
  // Hide modal on success.
  , createUser: function (e) {
    e.preventDefault();

    var user = this.model
      , attrs = {};

    this.$("input").each(function () {
      attrs[this.getAttribute("name")] = this.value;
    });

    user.save(attrs, {
      success: function (model, res) {
        model.set(res);

        this.$el.modal("hide");
      }.bind(this)

      , error: function (model, err) {
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
  }
});