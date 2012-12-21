var View = require("views/base/view")
  , app = require("application")
  , download = require("views/templates/download");

module.exports = View.extend({
  tagName: "li",
  className: "dropdown",
  model: app.currentTheme,

  events: {
    "click a": "askForPatience"
  },

  appEvents: {
    "save:after": "waitForArchive"
  },

  render: function () {
    this.$el.empty().append(download({id: this.model.id}));

    return this;
  },

  waitForArchive: function (theme) {
    var eventSource = new EventSource("/jobs/" + theme.get("archive_job_id"));

    this.waitingForArchive = true;

    eventSource.addEventListener("success", this.archiveSuccess.bind(this), false);
    eventSource.addEventListener("errors", this.archiveErrors.bind(this), false);
  },

  askForPatience: function (e) {
    if (this.waitingForArchive) {
      e.preventDefault();

      app.trigger("notification", "info", "The theme archives are being " +
                  "regenerated. Please try again in a moment.");
    }
  },

  archiveSuccess: function (e) {
    this.waitingForArchive = false;

    app.trigger("notification", "success", "Theme archives updated.");
  },

  archiveErrors: function (e) {
    this.waitingForArchive = false;

    app.trigger("notification", "error", "Error updating the theme archives.");
  }
});
