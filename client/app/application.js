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
    , AuthView = require("views/auth")
    , FaqView = require("views/faq")
    , ThemeView = require("views/theme")
    , LoginView = require("views/login")
    , RegisterView = require("views/register")
    , ThemeListView = require("views/theme_list")
    , TemplateSelectView = require("views/template_select")
    , BlockInsertView = require("views/block_insert")
    , StyleEditView = require("views/style_edit")
    , DownloadButtonView = require("views/download_button")
    , SiteView = require("views/site")
    , LayoutView = require("views/layout")
    , EditorView = require("views/editor")
    , NotFoundView = require("views/not_found")

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
  this.loginView = new LoginView();
  this.registerView = new RegisterView();
  this.notFoundView = new NotFoundView();
  this.templateSelectView = new TemplateSelectView({
    collection: this.templates
  });

  this.blockInsertView = new BlockInsertView({
    collection: this.blocks
  });

  this.styleEditView = new StyleEditView({
    collection: this.styles
  });

  this.downloadButtonView = new DownloadButtonView;

  this.themeListView = new ThemeListView({
    collection: this.themes
  });

  this.siteView = new SiteView({
      model: this.site
    , regions: this.regions.models
    , blocks: this.blocks.models
  });

  this.layoutView = new LayoutView();

  this.router = new Router();

  (new AuthView({
    user: this.currentUser
  }).render())

  // Application object should not be modified
  if (typeof Object.freeze === 'function') Object.freeze(this);
};

module.exports = Application;
