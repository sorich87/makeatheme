var app = require("application")
  , Themes = require("collections/themes");

module.exports = Backbone.Router.extend({
  routes: {
      "": "index"
    , "me/themes": "your_themes"
    , "themes/:id": "theme"
    , "themes/:id/edit": "theme_edit"
    , "themes/:id/fork": "theme_fork"
    , "preview/:id": "preview"
    , "editor/:id": "editor"
    , "editor/:id/:fork": "editor"
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

    $main.empty();

    if (!app.currentUser.id) {
      $main.append(app.reuseView("faq").render().$el);
    }

    if (window.MutationSummary === void 0) {
      alert = "<div class='alert alert-error'>" +
        "<b>Please Note:</b> Although the themes built with the online editor work in any browser, " +
        "the editor itself has been tested only with the latest versions of " +
        "<a href=''>Google Chrome</a> and <a href=''>Mozilla Firefox</a> so far. " +
        "Support for other browsers is coming soon.</div>";
    }

    $main
      .append(alert)
      .append("<h3 class='page-title'>Try out with a theme below</h3>")
      .append(app.createView("theme_list", {collection: collection}).render().$el)
      .append("<p>This is an open platform... If you are a professional web designer, please <a href='javascript:UserVoice.showPopupWidget();'>contact us</a>. We want to hear from you!</p>");
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
      , route: "preview"
    }).render().$el);
  }

  , theme_edit: function (id) {
    $("#main").empty().append(app.createView("theme", {
        themeID: id
      , route: "editor"
      , action: "edit"
    }).render().$el);
  }

  , theme_fork: function (id) {
    $("#main").empty().append(app.createView("theme", {
        themeID: id
      , route: "editor"
      , action: "fork"
    }).render().$el);
  }

  , preview: function (id) {
    if (app.data.theme === void 0) {
      window.top.Backbone.history.navigate("/404", {trigger: true, replace: true});
      return;
    }

    app.createView("preview").render();
  }

  , editor: function (id, action) {
    if (app.data.theme === void 0) {
      window.top.Backbone.history.navigate("/404", {trigger: true, replace: true});
      return;
    }

    // Initialize editor view
    app.createView("editor", {
      fork: action === "fork" ? true : false
    }).render();
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

  , notFound: function () {
    $("#main").empty()
      .append(app.reuseView("not_found").render().$el);
  }
});
