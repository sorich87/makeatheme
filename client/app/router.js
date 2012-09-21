var app = require("application")
  , Themes = require("collections/themes");

module.exports = Backbone.Router.extend({
  routes: {
      "": "index"
    , "me/themes": "your_themes"
    , "themes/:id": "theme"
    , "editor/:file": "editor"
    , "login": "login"
    , "register": "register"
    , "reset_password": "reset_password"
    , "upload": "upload"
    , "*actions": "notFound"
  }

  , index: function () {
    var collection = new Themes(app.data.themes)
      , alert = ""
      , $main = $("#main");

    if (window.MutationSummary === void 0) {
      alert = "<div class='alert alert-error'>\
        Although the themes built with the online editor work in any browser,\
        the editor itself has been tested only with the latest versions of\
        <a href=''>Google Chrome</a> and <a href=''>Mozilla Firefox</a> so far.\
        Support for other browsers is coming soon.</div>";
    }

    $main.empty().append(alert);

    if (!app.currentUser.id) {
      $main.append(app.reuseView("faq").render().$el);
    }

    $main
      .append("<h1 class='page-header'>Public Themes</h1>")
      .append(app.createView("theme_list", {collection: collection}).render().$el);
  }

  , your_themes: function () {
    var collection = new Themes(app.currentUser.get("themes"));

    $("#main").empty()
      .append("<h1 class='page-header'>Your Themes <small>(" + collection.length + ")</small></h1>")
      .append(app.createView("theme_list", {collection: collection}).render().$el);
  }

  , theme: function (id) {
    var themeView = app.createView("theme", {themeID: id});

    $("#main").empty().append(themeView.render().$el);

    // Add theme class to body
    $("body").addClass("theme");

    // Remove body class when navigating away from this route
    Backbone.history.on("route", function (e, name) {
      if (name !== "theme") {
        $("body").removeClass("theme");
      }
    });
  }

  , editor: function (id) {
    if (app.data.theme === void 0) {
      window.top.Backbone.history.navigate("/404", {trigger: true, replace: true});
      return;
    }

    // Initialize editor view
    app.createView("editor").render();

    // Setup drag and drop and resize
    app.createView("layout").render();
  }

  , login: function () {
    // Remove all modals and show the 'login' one
    // We could use modal("hide") here but it would trigger
    // events which we don't want
    $("body").removeClass("modal-open")
      .find(".modal, .modal-backdrop").remove().end()
      .append(app.createView("login").render().$el.modal("show"));
  }

  , register: function () {
    // Remove all modals and show the 'register' one
    // We could use modal("hide") here but it would trigger
    // events which we don't want
    $("body").removeClass("modal-open")
      .find(".modal, .modal-backdrop").remove().end()
      .append(app.createView("register").render().$el.modal("show"));
  }

  , reset_password: function () {
    // Remove all modals and show the 'reset_password' one
    // We could use modal("hide") here but it would trigger
    // events which we don't want
    $("body").removeClass("modal-open")
      .find(".modal, .modal-backdrop").remove().end()
      .append(app.createView("password_reset").render().$el.modal("show"));
  }

  , upload: function () {
    $("body").removeClass("modal-open")
      .find(".modal, .modal-backdrop").remove().end()
      .append(app.createView("theme_upload").render().$el.modal("show"));
  }

  , notFound: function () {
    $("#main").empty()
      .append(app.reuseView("not_found").render().$el);
  }
});
