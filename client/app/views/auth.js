// Display the login and register links
var View = require("views/base/view")
  , template = require("views/templates/auth_links");

module.exports = View.extend({
    el: $("#auth-links")

  , events: {
    "click #logout": "deleteSession"
  }

  , initialize: function () {
    this.model.on("change", this.render, this);
  }

  , render: function () {
    var links = template({currentUser: this.model.toJSON()});

    this.$el.empty().append(links);

    return this;
  }

  // Send request to delete current user session
  // and redirect to homepage on success
  , deleteSession: function () {
    $.ajax({
        contentType: "application/json; charset=UTF-8"
      , type: "DELETE"
      , url: "/session.json"
      , complete: function (jqXHR, textStatus) {
        if (textStatus === "success") {
          window.location = "/";
        }
      }.bind(this)
    });
  }
});
