var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    id: "x-download-button"

  , render: function () {
    this.$el.html("<button class='x-btn x-btn-success'>Download Theme</button>");

    $(window.document).on("click", "button", this.download);

    return this;
  }

  , download: function () {
    var customization = {
        regions: app.regions.models
      , templates: app.templates.models
    };

    $.ajax({
        url: "/themes/" + window.parent.themeID + "/customize.json"
      , type: "POST"
      , contentType: "application/json; charset=utf-8"
      , data: JSON.stringify(customization)
      , success: function(data) {
          var el = '<iframe src="data:application.zip/octet-stream;base64,'+data+'"></iframe>.';
          $('body').append($(el));
      }
    });
  }
});
