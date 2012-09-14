var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    className: "modal"
  , template: "theme_upload"

  , events: {
    "submit form": "sendFormData"
  }

  , sendFormData: function (e) {
    var $form = this.$("form");

    e.preventDefault();

    $form.children(".alert-error").remove();

    $.ajax({
        type: "POST"
      , url: "/themes"
      , data: new FormData($form[0])
      , success: function (data, textStatus, jqXHR) {
        this.$el.modal("hide");

        app.trigger("notification", "success", "Your theme is uploaded and ready to be customized!");
        // TODO: This is so wrong I want to cry.
        window.location = "/themes/" + data._id;
      }.bind(this)

      , error: function (jqXHR, textStatus, errorThrown) {
        var response = JSON.parse(jqXHR.responseText);

        for (i in response) {
          $form.prepend("<p class='alert alert-error'>" + response[i] + "</p>");
        }
      }

      , cache: false
      , contentType: false
      , dataType: "json"
      , processData: false
    });
  }
});
