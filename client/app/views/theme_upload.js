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
    button.innerHTML = "Processing. Please wait for a moment...";

    $form.children(".alert-error").remove();

    app.trigger("upload:before");

    $.ajax({
        type: "POST"
      , url: "/theme_upload"
      , data: new FormData($form[0])

      , success: function (data, textStatus, jqXHR) {
        var eventSource = new EventSource("/jobs/" + data.job_id);

        eventSource.addEventListener("success", this.themeUploaded.bind(this), false);
        eventSource.addEventListener("errors", this.themeErrors.bind(this), false);
      }.bind(this)

      , error: function (jqXHR, textStatus, errorThrown) {
        $form.prepend("<p class='alert alert-error'>" + errorThrown +
                      " Please refresh the page and try again.</p>");

        button.removeAttribute("disabled");
        button.innerHTML = "Upload Theme";
      }

      , cache: false
      , contentType: false
      , dataType: "json"
      , processData: false
    });
  }

  , themeUploaded: function (e) {
    var theme = JSON.parse(e.data);

    e.currentTarget.close();

    app.trigger("upload:after", theme);
    app.trigger("notification", "success", "Your theme is uploaded and ready to be edited!");

    this.$el.modal("hide");

    Backbone.history.navigate("/themes/" + theme._id + "/edit", true);
  }

  , themeErrors: function (e) {
    var key
      , errors = JSON.parse(e.data)
      , button = this.$("button[type=submit]")[0];

    e.currentTarget.close();

    for (key in errors) {
      if (errors.hasOwnProperty(key)) {
        this.$("form").prepend("<p class='alert alert-error'>" + _.str.humanize(key) + " " + errors[key] + "</p>");
      }
    }

    button.removeAttribute("disabled");
    button.innerHTML = "Upload Theme";
  }
});
