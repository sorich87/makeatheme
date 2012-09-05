var View = require("views/base/view");

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
      , url: "/themes"
      , data: new FormData(this.$("form")[0])
      , success: function(data, textStatus, jqXHR) {
        console.log(data, textStatus, jqXHR);
      }
      , error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown);
      }
      , cache: false
      , contentType: false
      , processData: false
    });
  }
});
