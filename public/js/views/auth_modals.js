// Display the login and register links and modals
define([
  "jquery",
  "underscore",
  "backbone",
  "init",
  "handlebars",
  "text!templates/auth_links.html",
  "text!templates/auth_modals.html"
], function ($, _, Backbone, init, Handlebars, authLinksTemplate, authModalsTemplate) {

  var AuthModalsView = Backbone.View.extend({
      el: $("body")

    , initialize: function () {
      this.render();
    }

    , render: function () {
      this.renderLinks();
      this.renderModals();

      return this;
    }

    , renderLinks: function () {
      var template, links;

      template = Handlebars.compile(authLinksTemplate)
      links = template({currentUser: init.currentUser});

      this.$("#auth-links").html("<ul class='nav'>" + links + "</ul>");
    }

    , renderModals: function () {
      require(["bootstrap/js/bootstrap-modal"], function () {
        // Hide modal previously shown before showing a new one
        $("#register, #login, #new-password, #confirm-password").on("show", function () {
          $("#register, #login, #new-password, #confirm-password").not("#" + this.id).modal("hide");
        })
      });

      $(authModalsTemplate).appendTo(this.$el);
    }
  });

  return AuthModalsView;
});
