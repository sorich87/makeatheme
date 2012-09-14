var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    className: "modal"
  , template: "reset_password"
  , model: app.currentUser

  , events: {
    "submit form#password_reset_step1": "initiatePasswordReset",
    "submit form#password_reset_step2": "createPasswordReset"
  }

  , initiatePasswordReset: function (e) {
    e.preventDefault();

    if (this.validateStepOneInputs()) {
      this.initiateReset();
    }
  }

  , createPasswordReset: function (e) {
    e.preventDefault();

    if (this.validateStepTwoInputs()) {
      this.createReset();
    }
  }

  , validateStepOneInputs: function () {
    var valid = true;

    this.$("form#password_reset_step1 input").each(function (i, element) {
      var attr = element.getAttribute("name");

      if (element.value === "") {
        var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " can't be blank";
        Backbone.Validation.callbacks.invalid(this, attr, msg, "name");

        valid = false;
      }
    }.bind(this));

    return valid;
  }

  , validateStepTwoInputs: function () {
    var valid = true;

    this.$("form#password_reset_step2 input").each(function (i, element) {
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
    var email = this.$("input[name=email]")[0].value;

    $.ajax({
        contentType: "application/json;charset=UTF-8"
      , dataType: "json"
      , type: "PUT"
      , url: "/users/"+email+"/initiate_password_reset"
     , complete: function (jqXHR, textStatus) {
        switch (jqXHR.status) {
          case 204:
          this.initiateStepTwo();
          break;

          case 404:
            window.location = "/404"
          break;
        }
      }.bind(this)
    });
  }

  , initiateStepTwo: function () {
    this.$("form#password_reset_step1").addClass("hidden");
    this.$("form#password_reset_step2").removeClass("hidden");
  }

  , createReset: function () {
    var token = this.$("input[name=reset_token]")[0].value;

    $.ajax({
        contentType: "application/json;charset=UTF-8"
      , dataType: "json"
      , type: "PUT"
      , url: "/users/"+token+"/reset_password"
     , complete: function (jqXHR, textStatus) {
        switch (jqXHR.status) {
          case 200:
            var response = JSON.parse(jqXHR.responseText);
            this.model.set(response);
            this.$el.modal("hide");
            app.trigger("notification", "success", "You have been logged in, please change your password.");
          break;

          case 404:
            window.location = "/404"
          break;
        }
      }.bind(this)
    });
  }

});
