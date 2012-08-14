// Application bootstrapper.

Application = window.Application || {};

Application.initialize = function() {
  var defaults = require("lib/defaults")

    // Get data set in the page, or parent frame if in iframe
    , data = this.data || window.parent.Application.data

    // collections
    , Blocks = require("collections/blocks")
    , Regions = require("collections/regions")
    , Templates = require("collections/templates")
    , Themes = require("collections/themes")

    // models
    , Site = require("models/site")

    // views
    , FaqView = require("views/faq")
    , ThemeView = require("views/theme")
    , AuthModalView = require("views/auth_modals")
    , ThemeListView = require("views/theme_list")
    , EditorView = require("views/editor")

    // router
    , Router = require("lib/router");

  // merge data from server with default values
  data = _.defaults(data, defaults);

  this.regions = new Regions(data.regions);
  this.blocks = new Blocks(data.blocks);
  this.templates = new Templates(data.templates);
  this.themes = new Themes(data.themes);
  this.site = new Site;

  this.faqView = new FaqView();
  this.themeView = new ThemeView();
  this.editorView = new EditorView();
  this.authModalView = new AuthModalView();

  this.themeListView = new ThemeListView({
    collection: this.themes
  });

  this.router = new Router();

  // Show modals when not in editor iframe
  if (! this.editor) {
    this.authModalView.render();
  }

  // Application object should not be modified
  if (typeof Object.freeze === 'function') Object.freeze(this);
};

module.exports = Application;
