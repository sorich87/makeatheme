var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    className: "modal"
  , template: "theme_upload"

  , events: {
    "submit form": "sendFormData"
  }

  , sendFormData: function (e) {
    var $form = this.$("form")
      , button = this.$("button[type=submit]")[0];

    e.preventDefault();

    button.setAttribute("disabled", "true");
    button.innerHTML = "Uploading... Please wait.";

    $form.children(".alert-error").remove();

    $.ajax({
        type: "POST"
      , url: "/themes"
      , data: new FormData($form[0])
      , success: function (data, textStatus, jqXHR) {
        // Remove modal without evant
        $("body").removeClass("modal-open")
          .find(".modal, .modal-backdrop").remove();

        app.trigger("notification", "success", "Your theme is uploaded and ready to be customized!");

        Backbone.history.navigate("/themes/" + data._id, true);
      }.bind(this)

      , error: function (jqXHR, textStatus, errorThrown) {
        var key
          , response = JSON.parse(jqXHR.responseText);

        for (key in response) {
          if (response.hasOwnProperty(key)) {
            $form.prepend("<p class='alert alert-error'>" + response[key] + "</p>");
          }
        }

        button.removeAttribute("disabled");
        button.innerHTML = "Upload Theme";
      }

      , cache: false
      , contentType: false
      , dataType: "json"
      , processData: false
    });
  }
});
