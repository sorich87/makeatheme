// Application bootstrapper.
Application.initialize = function() {
  var defaults = require("lib/defaults")

    // merge data from server with default values
    , data = _.defaults(this.data, defaults)

    // collections
    , BlocksCollection = require("collections/blocks")
    , RegionsCollection = require("collections/regions")
    , TemplatesCollection = require("collections/templates")
    , ThemesCollection = require("collections/themes")

    // models
    , Site = require("models/site")

    // views
    , FaqView = require("views/faq")
    , ThemeView = require("views/theme")
    , AuthModalView = require("views/auth_modals")
    , ThemeListView = require("views/theme_list")

    // router
    , Router = require("lib/router");

  this.regions = new RegionsCollection(data.regions);
  this.blocks = new BlocksCollection(data.blocks);
  this.templates = new TemplatesCollection(data.templates);
  this.themes = new ThemesCollection(data.themes);
  this.site = new Site;

  this.faqView = new FaqView();
  this.themeView = new ThemeView();

  this.authModalView = new AuthModalView();

  this.themeListView = new ThemeListView({
    collection: this.themes
  });

  this.router = new Router();

  this.authModalView.render();

  // Application object should not be modified
  if (typeof Object.freeze === 'function') Object.freeze(this);
};

module.exports = Application;
