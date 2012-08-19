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
      .append(app.faqView.render().$el)
      .append(app.themeListView.render().$el);
  }

  , theme: function (id) {
    // Set theme ID used in editor.
    window.themeID = id;
    $("#main").html(app.themeView.render().$el);
  }

  , editor: function (file) {
    app.editorView.render();
    app.layoutView.render();
  }

  , login: function () {
    // Remove all modals and show the 'login' one
    // We could use modal("hide") here but it would trigger
    // events which we don't want
    $("body").removeClass("modal-open")
      .find(".modal, .modal-backdrop").remove().end()
      .append(app.loginView.render().$el.modal("show"));
  }

  , register: function () {
    // Remove all modals and show the 'register' one
    // We could use modal("hide") here but it would trigger
    // events which we don't want
    $("body").removeClass("modal-open")
      .find(".modal, .modal-backdrop").remove().end()
      .append(app.registerView.render().$el.modal("show"));
  }

  , notFound: function () {
    $("#main").html(app.notFoundView.render().$el);
  }
});
