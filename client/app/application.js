// Application bootstrapper.

Application = window.Application || {};

_.extend(Application, {
  initialize: function() {
    var Router = require("router")
      , mixpanel = require("lib/mixpanel");

    // Set debug flag.
    this.debug = this.data.debug;

    // Setup notifications handling
    // Append to top window in case document is in an iframe
    this.createView("notifications").render()
      .$el.appendTo($("body", window.top.document));

    this.setCurrentUser();

    // Initialize router
    this.router = new Router();

    // Initialize Mixpanel tracking
    mixpanel.initialize();

    // Render the login and logout links
    this.createView("auth_links").render();

    // Set per-view body classes
    this.setBodyClasses();

    // Holds editor settings and data
    this.editor = {};

    // When login or registration modal is closed, go back to the previous page
    this.authRedirect();

    // Prevent further modification of the application object
    Object.freeze(this);
  }

  // Create a new view, cleanup if the view previously existed
  , createView: function (name, options) {
    var views = this.views || {}
      , View = require("views/" + name);

    if (views[name] !== void 0) {
      views[name].undelegateEvents();
      if (!options || !options.el) {
        views[name].remove();
      }
      views[name].off();
      if ("teardown" in views[name]) {
        views[name].teardown();
      }
    }

    views[name] = new View(options);
    this.views = views;
    return views[name];
  }

  , setBodyClasses: function () {
    // Don't set classes in editor
    if (this.data.theme) {
      return;
    }

    Backbone.history.on("route", function (router, name) {
      document.body.className = name;
    }.bind(this));
  }

  , setCurrentUser: function () {
    var User = require("models/user")
      , Themes = require("collections/themes");

    if (this.data.currentUser) {
      this.currentUser = new User(this.data.currentUser);
      this.currentUser.set("themes", new Themes(this.data.currentUser.themes));
    } else {
      this.currentUser = new User();
    }

    this.on("theme:created", this.updateCurrentUserThemes, this);
    this.on("theme:copied", this.updateCurrentUserThemes, this);
  }

  , updateCurrentUserThemes: function (theme) {
    this.currentUser.get("themes").add(theme);
  }

  , authRedirect: function () {
    this.on("login", this.historyBack);
    this.on("registration", this.historyBack);
  }

  , historyBack: function () {
    if (!Backbone.history.back(true)) {
      Backbone.history.navigate("/", true);
    }
  }
}, Backbone.Events);

module.exports = Application;
