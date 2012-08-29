// Application bootstrapper.

Application = window.Application || {};

_.extend(Application, {
  initialize: function() {
    var Router = require("router")
      , User = require("models/user");

    this.handleNotifications();

    // Initialize current user model instance
    this.currentUser = new User(this.data.currentUser);

    // Initialize router
    this.router = new Router();

    // Render the login and logout links
    this.reuseView("auth_links").render();

    // Prevent further modification of the application object
    Object.freeze(this);
  }

  // Create a new view, cleanup if the view previously existed
  , createView: function (name, options) {
    var views = this.views || {}
      , View = require("views/" + name);

    if (views[name] !== void 0) {
      views[name].undelegateEvents();
      views[name].remove();
      views[name].off();
    }

    views[name] = new View(options);
    this.views = views;
    return views[name];
  }

  // Return existing view, otherwise create a new one
  , reuseView: function(name, options) {
    var views = this.views || {}
      , View = require("views/" + name);

    if (views[name] !== void 0) {
      return views[name];
    }

    views[name] = new View(options);
    this.views = views;
    return views[name];
  }

  , handleNotifications: function () {
    this.on("notification", function (type, text) {
      this.createView("notification", {type: type, text: text})
        .render().$el.appendTo($("body"));
    }.bind(this));
  }
}, Backbone.Events);

module.exports = Application;
