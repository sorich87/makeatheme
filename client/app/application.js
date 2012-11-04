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
    this.reuseView("auth_links").render();

    // Set per-view body classes
    this.setBodyClasses();

    // Set editor width
    this.setEditorWidth();

    // Holds editor settings and data
    this.editor = {};

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

  , setBodyClasses: function () {
    Backbone.history.on("route", function (router, name) {
      if (!this.currentUser.id) {
        name += " anonymous";
      }
      document.body.className = name;
    }.bind(this));
  }

  , setEditorWidth: function () {
    Backbone.history.on("route", function (router, name) {
      if (name === "theme") {
        $("#main")
          .width($(window).width() - 250)
          .height($(window).height() - 60);
      } else {
        $("#main").removeAttr("style");
      }
      $("#layout-editor").remove();
    });
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

    this.on("upload:after", this.updateCurrentUserThemes);
  }

  , updateCurrentUserThemes: function (theme) {
    this.currentUser.get("themes").add(theme);
  }
}, Backbone.Events);

module.exports = Application;
