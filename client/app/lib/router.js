var app = require("application");

module.exports = Backbone.Router.extend({
  routes: {
      "": "index"
    , "themes/:id": "theme"
    , "editor/:file": "editor"
    , "login": "login"
    , "register": "register"
    , "*actions": "notFound"
  }

  , index: function () {
    $("#main").empty()
      .append(app.reuseView("faq").render().$el)
      .append(app.reuseView("theme_list").render().$el);
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
    // Setup editor box
    app.createView("editor").render().$el
      .append(app.createView("template_select").render().$el)
      .append(app.createView("block_insert").render().$el)
      .append(app.createView("style_edit").render().$el)
      .append(app.createView("download_button").render().$el)

    // Render page and append editor to it
      .appendTo(app.createView("site").render().$el);

    // Setup drag and drop and resize
    app.createView("layout").render();
  }

  , login: function () {
    // Remove all modals and show the 'login' one
    // We could use modal("hide") here but it would trigger
    // events which we don't want
    $("body").removeClass("modal-open")
      .find(".modal, .modal-backdrop").remove().end()
      .append(app.reuseView("login").render().$el.modal("show"));
  }

  , register: function () {
    // Remove all modals and show the 'register' one
    // We could use modal("hide") here but it would trigger
    // events which we don't want
    $("body").removeClass("modal-open")
      .find(".modal, .modal-backdrop").remove().end()
      .append(app.reuseView("register").render().$el.modal("show"));
  }

  , notFound: function () {
    $("#main").empty()
      .append(app.reuseView("not_found").render().$el);
  }
});
