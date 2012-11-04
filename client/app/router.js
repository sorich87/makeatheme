var app = require("application")
  , Themes = require("collections/themes");

module.exports = Backbone.Router.extend({
  routes: {
      "": "index"
    , "themes": "themes"
    , "me/themes": "your_themes"
    , "themes/:id": "theme"
    , "themes/:id/edit": "edit"
    , "login": "login"
    , "register": "register"
    , "reset_password": "reset_password"
    , "upload": "upload"
    , "*actions": "notFound"
  }

  , index: function () {
  }

  , themes: function () {
    var collection = new Themes(app.data.themes)
      , $main = $("#main");

    $main.empty();

    if (app.currentUser.id) {
      $main
        .append("<div id='new-button'><a href='/themes/new' " +
                "data-event='New Theme:type:from scratch'" +
                "class='btn btn-primary btn-large' data-bypass='true'>" +
                "Create a New Theme</a></div>")
        .append("<h3 class='page-title'>Or copy a theme below</h3>")
        .append(app.createView("theme_list", {collection: collection}).render().$el);
    }
  }

  , your_themes: function () {
    var collection = app.currentUser.get("themes");

    $("#main").empty()
      .append("<h1 class='page-header'>Your Themes <small>(" + collection.length + ")</small></h1>")
      .append(app.createView("theme_list", {collection: collection}).render().$el);
  }

  , theme: function (id) {
    $("#main").empty().append(app.createView("theme", {
      themeID: id
    }).render().$el);
  }

  , edit: function (id) {
    if (app.data.theme === void 0) {
      window.top.Backbone.history.navigate("/404", {trigger: true, replace: true});
      return;
    }

    app.createView("editor").render();
  }

  , login: function () {
    $(".modal").modal("hide");

    $("body").append(app.createView("login").render().$el.modal("show"));
  }

  , register: function () {
    $(".modal").modal("hide");

    $("body").append(app.createView("register").render().$el.modal("show"));
  }

  , reset_password: function () {
    $(".modal").modal("hide");

    $("body").append(app.createView("password_reset").render().$el.modal("show"));
  }

  , upload: function () {
    $(".modal").modal("hide");

    $("body").append(app.createView("theme_upload").render().$el.modal("show"));
  }

  , notFound: function (action) {
    $("#main").empty()
      .append(app.reuseView("not_found").render().$el);
  }
});
