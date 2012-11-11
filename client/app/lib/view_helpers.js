var app = require("application")
  , User = require("models/user");

Handlebars.registerHelper("currentUser", function () {
  if (app.currentUser.id) {
    return app.currentUser;
  }
});

