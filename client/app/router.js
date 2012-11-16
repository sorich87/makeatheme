var app = require("application")
  , Themes = require("collections/themes");

module.exports = Backbone.Router.extend({
  routes: {
      "": "your_themes"
    , "themes": "themes"
    , "themes/:id": "theme"
    , "themes/:id/edit": "edit"
    , "login": "login"
    , "register": "register"
    , "reset_password": "reset_password"
    , "upload": "upload"
    , "*actions": "notFound"
  }

  , themes: function () {
    this.userOnly();

    var collection = new Themes(app.data.themes);

    $("#main").empty()
      .append("<div id='new-button'><a href='/themes/new' " +
              "data-event='New Theme:type:from scratch'" +
              "class='btn btn-primary btn-large' data-bypass='true'>" +
              "Create a Theme from Scratch</a></div>")
      .append("<h3 class='page-title'>Or copy a theme below</h3>")
      .append(app.createView("theme_list", {collection: collection}).render().$el);
  }

  , your_themes: function () {
    this.userOnly();

    var collection = app.currentUser.get("themes");

    $("#main").empty()
      .append("<h1 class='page-header'>Your Themes <small>(" + collection.length + ")</small>" +
              " <a href='/themes' class='btn btn-primary'>" +
              "Create a New Theme</a></h1>")
      .append(app.createView("theme_list", {collection: collection}).render().$el);
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

  , upload: function () {
    $("#main").empty().append(app.createView("theme_upload").render().$el);
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
