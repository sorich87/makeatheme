var View = require("views/base/view")
  , app = require("application")
  , download_button = require("views/templates/download_button");

module.exports = View.extend({
    id: "download-button"

  , events: {
    "click button.x-login": "login"
  }

  , initialize: function () {
    app.on("save:after", this.waitForArchive.bind(this));
  }

  , render: function () {
    var button;

    if (app.currentUser.id === void 0) {
      button = "<button class='btn btn-success x-login'>Login to Download</button>";
    } else {
      button = download_button({id: app.data.theme._id});
    }

    this.$el.empty().append(button);

    if (!app.data.theme.has_archive) {
      this.$el.hide();
    }

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

    this.$el.show();

    button.setAttribute("disabled", "true");
    button.innerHTML = "Rebuilding archives...";

    eventSource.addEventListener("success", this.archiveSuccess.bind(this), false);
    eventSource.addEventListener("errors", this.archiveErrors.bind(this), false);
  }

  , resetButton: function (e) {
    var button = this.$("button")[0];

    e.currentTarget.close();

    button.removeAttribute("disabled");
    button.innerHTML = "Download Theme <span class='caret'></span>";
  }

  , archiveSuccess: function (e) {
    this.resetButton(e);

    app.trigger("notification", "success", "Theme archives updated.");
  }

  , archiveErrors: function (e) {
    this.resetButton(e);

    app.trigger("notification", "error", "Error updating the theme archives.");
  }
});
