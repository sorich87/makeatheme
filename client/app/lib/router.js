var app = require("application");

module.exports = Backbone.Router.extend({
  routes: {
      "": "index"
    , "themes/:id": "theme"
    , "editor/:file": "editor"
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
});
