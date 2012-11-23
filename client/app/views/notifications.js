// Notifications view
// Show all notifications in an ul
// Listen to notification events to render a notification and append it to the ul
// Hide the notification after 4s
var app = require("application")
  , View = require("views/base/view")
  , template = require("views/templates/notification");

module.exports = View.extend({
    tagName: "ul"
  , id: "notifications"
  , className: "unstyled"

  , initialize: function () {
    app.on("notification", this.showNotification, this);
  }

  , teardown: function () {
    app.off("notification", this.showNotification, this);
  }

  , showNotification: function (type, text) {
    var $li = $(template({type: type, text: text})).appendTo(this.$el);

    setTimeout(function () {
      $li.alert("close");
    }, 4000);

    return this;
  }
});
