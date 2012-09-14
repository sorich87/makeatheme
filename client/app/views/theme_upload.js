var View = require("views/base/view")
  , app = require("application");;

module.exports = View.extend({
    className: "modal"
  , template: "theme_upload"

  , events: {
    "submit form": "sendFormData"
  }

  , sendFormData: function (e) {
    e.preventDefault();

    $.ajax({
        type: "POST"
      , contentType: "application/json;charset=UTF-8"
      , url: "/themes"
      , data: new FormData(this.$("form")[0])
      , success: function(data, textStatus, jqXHR) {
        this.$el.modal("hide");
        app.trigger("notification", "success", "Your theme is uploaded and ready to be customized!");
        // TODO: This is so wrong I want to cry.
        window.location = "/themes/" + data._id;
      }.bind(this)

      , error: function(jqXHR, textStatus, errorThrown) {
        this.$el.modal("hide");
        app.trigger("notification", "error", "The theme you provided was not valid.");
      }.bind(this)

      , cache: false
      , contentType: false
      , processData: false
    });
  }
});
