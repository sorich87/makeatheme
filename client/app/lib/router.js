var app = require("application");

module.exports = Backbone.Router.extend({
  routes: {
      "": "index"
    , "themes/:id": "theme"
  }

  , index: function() {
    $("#main").empty()
      .append(app.faqView.render().$el)
      .append(app.themeListView.render().$el);
  }

  , theme: function(id) {
    $("#main").html(app.themeView.render().$el);
  }
});
