// Display the login and register links and modals
var app = require("application")
  , View = require("views/base/view")
  , authLinksTemplate = require("views/templates/auth_links")
  , authModalsTemplate = require("views/templates/auth_modals");

module.exports = View.extend({
    el: $("body")

  , render: function () {
    this.renderLinks();
    this.renderModals();

    return this;
  }

  , renderLinks: function () {
    var links;

    links = authLinksTemplate({currentUser: app.currentUser});

    $("#auth-links").html("<ul class='nav'>" + links + "</ul>");
  }

  , renderModals: function () {
    // Hide modal previously shown before showing a new one
    $("#register, #login, #new-password, #confirm-password").on("show", function () {
      $("#register, #login, #new-password, #confirm-password").not("#" + this.id).modal("hide");
    })

    $(authModalsTemplate()).appendTo(this.$el);
  }
});
