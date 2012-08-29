var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    className: "modal"
  , template: "login"
  , model: app.currentUser

  , events: {
    "click button[type=submit]": "loginUser"
  }

  , loginUser: function (e) {
    e.preventDefault();

    if (this.validateInputs()) {
      this.submitData();
    }
  }

  , validateInputs: function () {
    var valid = true;

    this.$("input").each(function (i, element) {
      var attr = element.getAttribute("name");

      if (element.value === "") {
        var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " can't be blank";
        Backbone.Validation.callbacks.invalid(this, attr, msg, "name");

        valid = false;
      }
    }.bind(this));

    return valid;
  }

  , submitData: function () {
    var data = {};

    this.$("input").each(function (i, element) {
      var attr = element.getAttribute("name");

      data[attr] = element.value;
    });

    $.ajax({
        contentType: "application/json;charset=UTF-8"
      , dataType: "json"
      , type: "POST"
      , url: "/session.json"
      , data: JSON.stringify(data)
      , complete: function (jqXHR, textStatus) {
        var response = JSON.parse(jqXHR.responseText);

        switch (textStatus) {
          case "success":
            this.model.set(response);

            this.$el.modal("hide");

            app.trigger("notification", "success", "Welcome back, " + this.model.get("first_name") + ".");
          break;

          case "error":
            var form = this.$("form");

            if (form.children(".alert-error").length === 0) {
              form.prepend("<p class='alert alert-error'>" + response.error + "</p>");
            }
          break;
        }
      }.bind(this)
    });
  }
});
