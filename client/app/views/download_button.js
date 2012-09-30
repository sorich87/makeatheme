var View = require("views/base/view")
  , app = require("application");

module.exports = View.extend({
    id: "x-download-button"

  , events: {
      "click button.x-download": "download"
    , "click button.x-login": "login"
  }

  , initialize: function () {
    app.on("save:after", this.waitForArchive.bind(this));
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
    var $iframe = $("#download-iframe", window.top.document)
      , url = "/themes/" + app.data.theme._id + "/download";

    e.preventDefault();

    if ($iframe.length === 0) {
      $iframe = $("<iframe id='download-iframe' width='0' height='0' src='" + url + "'></iframe>")
        .appendTo($("body", window.top.document));
    } else {
      $iframe.attr("src", url);
    }
  }

  , waitForArchive: function (theme) {
    var button = this.$("button")[0]
      , eventSource = new EventSource("/jobs/" + theme.get("archive_job_id"));

    button.setAttribute("disabled", "true");
    button.innerHTML = "Rebuilding archive...";

    eventSource.addEventListener("success", this.resetButton.bind(this), false);
    eventSource.addEventListener("errors", this.archiveErrors.bind(this), false);
  }

  , resetButton: function () {
    var button = this.$("button")[0];

    button.removeAttribute("disabled");
    button.innerHTML = "Download Theme";
  }

  , archiveErrors: function () {
    this.resetButton();

    app.trigger("notification", "error", "Error generating the theme archive");
  }
});
