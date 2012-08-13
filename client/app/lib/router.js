var app = require("application");

module.exports = Backbone.Router.extend({
  routes: {
      "": "index"
    , "themes/:id": "theme"
  }

  , index: function() {
    $("#main").html(app.indexView.render().$el);
  }

  , theme: function(id) {
    $("#main").html(app.themeView.render().$el);
  }
});
