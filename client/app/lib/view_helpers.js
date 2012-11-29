var app = require("application")
  , User = require("models/user");

Handlebars.registerHelper("current_user", function () {
  return !!app.currentUser.id;
});

Handlebars.registerHelper("selected", function (value, current) {
  return value === current ? " selected='selected'" : "";
});
