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
    this.view = app.createView("themes");
    this.render();
  }

  , user_themes: function () {
    this.userOnly();
    this.view = app.createView("user_themes");
    this.render();
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
    this.view = app.createView("account");
    this.render();
  }

  , login: function () {
    this.anonymousOnly();
    this.view = app.createView("login");
    this.render();
  }

  , register: function () {
    this.anonymousOnly();
    this.view = app.createView("register");
    this.render();
  }

  , reset_password: function () {
    this.anonymousOnly();
    this.view = app.createView("password_reset");
    this.render();
  }

  , notFound: function (action) {
    this.view = app.createView("not_found");
    this.render();
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

  , render: function () {
    if (this._currentView) {
      this._currentView.teardown();
    }

    this._currentView = this.view;

    $("#main").empty().append(this.view.render().$el);
  }
});
