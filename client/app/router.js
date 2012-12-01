var app = require("application");

module.exports = Backbone.Router.extend({
  routes: {
      "": "user_themes"
    , "themes": "themes"
    , "themes/:id": "theme"
    , "themes/:id/edit": "edit"
    , "account": "account"
    , "login": "login"
    , "register": "register"
    , "reset_password": "reset_password"
    , "*actions": "notFound"
  }

  , themes: function () {
    this.userOnly();

    $("#main").empty()
      .append(app.createView("themes").render().$el);
  }

  , user_themes: function () {
    this.userOnly();

    $("#main").empty()
      .append(app.createView("user_themes").render().$el);
  }

  , theme: function (id) {
    app.createView("theme", {
        themeID: id
      , el: $("#main")
    }).render();

    jQuery(function ($) {
      $("body").on("click", ".accordion-toggle", function (e) {
        $(".color").spectrum({
            showAlpha: true
          , showInput: true
          , showPalette: true
          , preferredFormat: "rgb"
          , change: function(color, i) {
            $("#theme").get(0).contentWindow.$(this).trigger("change");
          }
        });
      });
    });
  }

  , edit: function (id) {
    if (app.data.theme === void 0) {
      window.top.Backbone.history.navigate("/404", {trigger: true, replace: true});
      return;
    }

    app.createView("editor").render();
  }

  , account: function () {
    this.userOnly();

    $("#main").empty().append(app.createView("account").render().$el);
  }

  , login: function () {
    this.anonymousOnly();

    $("#main").empty().append(app.createView("login").render().$el);
  }

  , register: function () {
    this.anonymousOnly();

    $("#main").empty().append(app.createView("register").render().$el);
  }

  , reset_password: function () {
    this.anonymousOnly();

    $("#main").empty().append(app.createView("password_reset").render().$el);
  }

  , notFound: function (action) {
    $("#main").empty()
      .append(app.reuseView("not_found").render().$el);
  }

  , userOnly: function () {
    if (!app.currentUser.id) {
      document.location = "/login";
      return true;
    }
  }

  , anonymousOnly: function () {
    if (app.currentUser.id) {
      document.location = "/";
      return true;
    }
  }
});
