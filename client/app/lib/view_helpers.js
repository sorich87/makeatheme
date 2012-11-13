var app = require("application")
  , User = require("models/user");

Handlebars.registerHelper("currentUser", function () {
  if (app.currentUser.id) {
    return app.currentUser;
  }
});

Handlebars.registerHelper("selected", function (value, current) {
  return value === current ? " selected='selected'" : "";
});
