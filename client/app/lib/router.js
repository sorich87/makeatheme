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
    // Set theme ID used in editor.
    window.themeID = id;

    $("#main").empty()
      .append(app.createView("theme").render().$el);
  }

  , editor: function (file) {
    // Setup editor box
    editorView.render().$el
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
