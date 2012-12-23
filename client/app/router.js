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
    this.view = app.createView("theme", {themeID: id});
    this.render();

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
    if (app.currentTheme === void 0) {
      $("#main", window.top.document).empty()
        .append(app.createView("not_found").render().$el);
      return;
    }

    $("#menubar", window.top.document).empty()
      .append(app.createView("menubar").render().$el);

    if (app.currentUser.canEdit(app.currentTheme)) {
      app.createView("editor").render();

      $("body", window.top.document).addClass("edit");
    } else {
      $("body", window.top.document).addClass("preview");
    }
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
