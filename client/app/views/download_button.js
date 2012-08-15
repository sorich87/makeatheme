var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    el: "<button id='x-download-button' class='x-btn x-btn-success'>Download Theme</button>"

  , initialize: function () {
    _.bindAll(this, ["download"]);
    $(window.document).on("click", this.$el, this.download);
  }

  , download: function () {
    var customization = {
        regions: app.regions.toJSON()
      , templates: app.templates.toJSON()
    };

    $.post("/themes/" + theme + "/customize.json", function (data) {
      // Do something with the result
    });
  }
});
