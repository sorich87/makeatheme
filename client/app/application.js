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
    this.setCurrentTheme();

    // Initialize router
    this.router = new Router();

    // Initialize Mixpanel tracking
    mixpanel.initialize();

    // Render the login and logout links
    this.createView("auth_links").render();

    // Set per-view body classes
    this.setBodyClasses();

    // When login or registration modal is closed, go back to the previous page
    this.authRedirect();

    // Prevent further modification of the application object
    Object.freeze(this);
  }

  // Create a new view
  , createView: function (name, options) {
    var View = require("views/" + name);

    return new View(options);
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

  , setCurrentTheme: function () {
    var Theme = require("models/theme"),
        Blocks = require("collections/blocks"),
        Regions = require("collections/regions"),
        Templates = require("collections/templates"),
        CustomCSS = require("lib/custom_css");

    if (this.data.theme) {
      this.currentTheme = new Theme(this.data.theme);

      if (this.data.theme_pieces) {
        var blocks = new Blocks(this.data.theme_pieces.blocks),
            regions = new Regions(this.data.theme_pieces.regions),
            templates = new Templates(this.data.theme_pieces.templates);

        this.currentTheme.set("blocks", blocks);
        this.currentTheme.set("regions", regions);
        this.currentTheme.set("templates", templates);
      }

      if (this.data.style) {
        this.currentTheme.set("style", new CustomCSS(this.data.style));
      }
    }
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
