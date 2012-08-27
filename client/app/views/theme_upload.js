var View = require("views/base/view");

module.exports = View.extend({
    className: "modal"
  , template: "theme_upload"

  , initialize: function() {
    var $el = this.$el;

    $(document).ready(function() {
      var $form = $el.find("form");

      $form.submit(function(e) {
        e.preventDefault();
        var formData;

        formData = new FormData($form[0]);

        $.ajax({
            type: "POST"
          , url: "/themes.json"
          , data: formData
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

        return false;
      });
    })
  }
});
