var View = require("views/base/view")
  , Theme = require("models/theme")
  , app = require("application");

module.exports = View.extend({
    id: "x-download-button"

  , events: {
      "click button.x-download": "download"
    , "click button.x-login": "login"
  }

  , initialize: function () {
    this.regions = app.regions;
    this.templates = app.templates;
  }

  , render: function () {
    var button;

    if (app.currentUser.id === void 0) {
      button = "<button class='x-btn x-btn-success x-login'>Login to Download</button>";
    } else {
      button = "<button class='x-btn x-btn-success x-download'>Download Theme</button>";
    }

    this.$el.empty().append(button);

    return this;
  }

  , login: function () {
    window.top.Backbone.history.navigate("/login", true);
  }

  , download: function (e) {
    var attrs, regions, templates;

    regions = _.map(this.regions.models, function (region) {
      return _.pick(region.attributes, "_id", "name", "slug", "template");
    });

    templates = _.map(this.templates.models, function (template) {
      return _.pick(template.attributes, "_id", "name", "template");
    });

    attrs = _.extend(app.data.theme, {
        regions: regions
      , templates: templates
    });
    e.target.setAttribute("disabled", "true");
    e.target.innerHTML = "Baking... Please wait.";

    (new Theme).save(attrs, {
      success: function (theme) {
        // Add Iframe with archive URL as src to trigger download
        var $iframe = $("#download-iframe", window.top.document);

        if ($iframe.length === 0) {
          $iframe = $("<iframe id='download-iframe' width='0' height='0' src='" + theme.get("archive") + "'></iframe>")
            .appendTo($("body", window.top.document));
        } else {
          $iframe.attr("src", theme.get("archive"));
        }

        e.target.removeAttribute("disabled");
        e.target.innerHTML = "Download Theme";

        window.top.Backbone.history.navigate("/themes/" + theme.id, true);
      }
      , error: function (theme, response) {
        app.trigger("notification", "error", "Sorry, we are unable to generate the theme archive. Please try again.");

        e.target.removeAttribute("disabled");
        e.target.innerHTML = "Download Theme";
      }
    });
  }
});
