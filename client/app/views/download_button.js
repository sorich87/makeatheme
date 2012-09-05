var View = require("views/base/view")
  , Theme = require("models/theme")
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

  , download: function (e) {
    var attrs = _.extend(app.data.theme, {
        regions: this.regions.models
      , templates: this.templates.models
    });
    e.target.setAttribute("disabled", "true");
    e.target.innerHTML = "Baking... Please wait.";

    (new Theme).save(attrs, {
      success: function(theme) {
        // Add Iframe with archive URL as src to trigger download
        var $iframe = $("#download-iframe", window.top.document);

        if ($iframe.length === 0) {
          $iframe = $("<iframe id='#download-iframe' src='" + theme.get("archive") + "'></iframe>")
            .appendTo($("body", window.top.document));
        } else {
          $iframe.attr("src", theme.get("archive"));
        }

        e.target.removeAttribute("disabled");
        e.target.innerHTML = "Download Theme";

        window.top.Backbone.history.navigate("/themes/" + theme.id, true);
      }
    });
  }
});
