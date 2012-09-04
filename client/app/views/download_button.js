var View = require("views/base/view")
  , Regions = require("collections/regions")
  , Templates = require("collections/templates")
  , app = require("application");

module.exports = View.extend({
    id: "x-download-button"

  , events: {
    "click button": "download"
  }

  , initialize: function () {
    this.regions = app.regions;
    this.templates = app.templates;
  }

  , render: function () {
    this.$el.empty().append("<button class='x-btn x-btn-success'>Download Theme</button>");

    return this;
  }

  , download: function () {
    var customization = {
        regions: this.regions.models
      , templates: this.templates.models
    };

    $.ajax({
        url: "/themes/" + app.data.theme._id + ".json"
      , type: "POST"
      , contentType: "application/json; charset=utf-8"
      , data: JSON.stringify(customization)
      , success: function(theme) {
        window.open(theme.archive, "_blank");
      }
    });
  }
});
