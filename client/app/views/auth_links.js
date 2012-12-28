// Display the login and register links
var View = require("views/base/view")
  , template = require("views/templates/auth_links")
  , app = require("application");

module.exports = View.extend({
    el: $("#auth-links")
  , model: app.currentUser

  , events: {
    "click #logout": "deleteSession"
  }

  , objectEvents: {
    model: {
      "change": "render"
    }
  }

  , render: function () {
    var links = template(this.model.toJSON());

    this.$el.empty().append(links);

    return this;
  }

  // Send request to delete current user session
  // and redirect to homepage on success
  , deleteSession: function (e) {
    e.preventDefault();

    $.ajax({
        contentType: "application/json; charset=UTF-8"
      , dataType: "json"
      , type: "DELETE"
      , url: "/session"
      , complete: function (jqXHR, textStatus) {
        if (textStatus === "success") {
          sessionStorage.clear();

          app.trigger("logout");

          setTimeout(function () {
            window.location = "/login";
          });
        }
      }.bind(this)
    });
  }
});
