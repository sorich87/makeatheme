(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"application": function(exports, require, module) {
  // Application bootstrapper.

  Application = window.Application || {};

  _.extend(Application, {
    initialize: function() {
      var Router = require("router")
        , User = require("models/user")
        , Templates = require("collections/templates")
        , Regions = require("collections/regions")
        , Blocks = require("collections/blocks");

      // Setup notifications handling
      // Append to top window in case document is in an iframe
      this.createView("notifications").render()
        .$el.appendTo($("body", window.top.document));

      // Initialize current user model instance
      this.currentUser = new User(this.data.currentUser);

      // Load default collections models
      if (this.data.theme_pieces) {
        this.templates = new Templates(this.data.theme_pieces.templates);
        this.regions = new Regions(this.data.theme_pieces.regions);
        this.blocks = new Blocks(this.data.theme_pieces.blocks);
      }

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
  }, Backbone.Events);

  module.exports = Application;
  
}});

window.require.define({"collections/base/collection": function(exports, require, module) {
  // Base class for all collections.
  module.exports = Backbone.Collection.extend({
    
  });
  
}});

window.require.define({"collections/blocks": function(exports, require, module) {
  // Blocks collection class.
  var Collection = require("collections/base/collection")
    , Block = require("models/block");

  module.exports = Collection.extend({
    model: Block
  });
  
}});

window.require.define({"collections/regions": function(exports, require, module) {
  // Regions collection class.
  var Collection = require("collections/base/collection")
    , Region = require("models/region");

  module.exports = Collection.extend({
      model: Region

    // Get region by name. Use "default" if slug not specified.
    , getByName: function (name, slug) {
      if (slug === void 0) {
        slug = "default";
      }

      return this.find(function (region) {
        return region.get("slug") === slug && region.get("name") === name;
      });
    }
  });
  
}});

window.require.define({"collections/templates": function(exports, require, module) {
  // Templates collection class.
  var Collection = require("collections/base/collection")
    , Template = require("models/template");

  module.exports = Collection.extend({
      model: Template

    // Get a template by its name
    , getByName: function (name) {
      return this.find(function (template) {
        return template.get("name") === name;
      });
    }

    // Get template being edited
    , getCurrent: function () {
      var current = this.find(function (template) {
        return template.get("current") === true;
      });

      if (! current) {
        current = this.getByName("index");
      }

      return current;
    }

    // Save template being edited
    , setCurrent: function (template) {
      var oldCurrent;
      if (oldCurrent = this.getCurrent()) {
        oldCurrent.set("current", false);
      }

      template.set("current", true);
    }
  });
  
}});

window.require.define({"collections/themes": function(exports, require, module) {
  // Themes collection class.
  var Collection = require("collections/base/collection")
    , Theme = require("models/theme");

  module.exports = Collection.extend({
      model: Theme
    , url: "/themes"
  });
  
}});

window.require.define({"initialize": function(exports, require, module) {
  var application = require('application');

  $(function() {
    application.initialize();

    // Enable HTML5 pushstate
    Backbone.history.start({pushState: true});

    jQuery(function ($) {

      // When a modal is closed, go back to the previous page
      // or go to the homepage if no previous page (#main is empty)
      $(document).on("hidden", ".modal", function () {
        if ($("#main").children().length === 0) {
          Backbone.history.navigate("/", true);
        } else {
          history.go(-1);
        }
      });

      // All navigation that is relative should be passed through the navigate
      // method, to be processed by the router.
      // If the link has a `data-bypass` attribute, bypass the delegation completely.
      // If the link has a `data-replace` attribute, update the URL without creating
      // an entry in the browser history.
      $(document).on("click", "a:not([data-bypass])", function(e) {
        var href = { prop: $(this).prop("href"), attr: $(this).attr("href") }
          , root = location.protocol + "//" + location.host + "/";

        if (href.prop && href.prop.slice(0, root.length) === root) {
          e.preventDefault();

          Backbone.history.navigate(href.attr, {
            trigger: true,
            replace: !!$(this).data("replace")
          });
        }
      });
    });
  });
  
}});

window.require.define({"lib/custom_css": function(exports, require, module) {
  // Manage custom css in the document <head>
  // and a 'rules' hash for easy access

  var CustomCSS = function (rules) {
    var node = document.createElement("style");

    node.type = "text/css";
    node.rel = "alternate stylesheet";

    document.head.appendChild(node);

    this.node = node;
    this.sheet = node.sheet;

    this.insertRules(rules);
  };

  CustomCSS.prototype.insertRule = function (selector, property, value) {
    var index;

    if (!selector || !property || !value) {
      return;
    }

    this.deleteRule(selector, property);

    index = this.sheet.cssRules.length;

    this.rules[selector] = this.rules[selector] || {};
    this.rules[selector][property] = {
        value: value
      , index: index
    };

    return this.sheet.insertRule(selector + " {" + property + ": " + value + "}", index);
  };

  CustomCSS.prototype.insertRules = function (rules) {
    var rule
      , rules = rules || {};

    for (selector in rules) {
      for (property in rules[selector]) {
        rule = rules[selector][property];

        this.sheet.insertRule(selector + " {" + property + ": " + rule.value + "}", rule.index);
      }
    }

    this.rules = rules;
  };

  CustomCSS.prototype.getRule = function (selector, property) {
    if (!selector || !property) {
      return;
    }

    if (!this.rules[selector] || !this.rules[selector][property]) {
      return;
    }

    return this.rules[selector][property].value;
  };

  CustomCSS.prototype.deleteRule = function (selector, property) {
    if (!selector || !property) {
      return;
    }

    if (!this.rules[selector] || !this.rules[selector][property]) {
      return;
    }

    this.sheet.deleteRule(this.rules[selector][property].index);

    return delete this.rules[selector][property];
  };

  CustomCSS.prototype.toString = function () {
    var string = "";

    if (!this.rules || this.rules.length === 0) {
      return;
    }

    for (selector in this.rules) {
      string += selector + " {\n";

      for (property in this.rules[selector]) {
        string += property + ": " + this.rules[selector][property].value + ";\n";
      }

      string += "}\n";
    }

    return string;
  };

  module.exports = CustomCSS;
  
}});

window.require.define({"models/base/model": function(exports, require, module) {
  // Base class for all models.
  module.exports = Backbone.Model.extend({
  });
  
}});

window.require.define({"models/block": function(exports, require, module) {
  // Block model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
    defaults: {
        name: ""
      , template: ""
      , build: ""
    }

    , label: function () {
      return _.str.humanize(this.get("name"));
    }

    , className: function () {
      return this.get("name").replace("_", "-");
    }

    // Return block Handlebars tag
    , tag: function () {
      return "{{ " + this.get("name") + " }}";
    }
  });
  
}});

window.require.define({"models/region": function(exports, require, module) {
  // Region model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
    defaults: {
        slug: ""
      , name: ""
      , template: ""
    }

    , validate: function (attrs) {
      if (["header", "footer"].indexOf(attrs.name) < 0) {
        return "Region must be header or footer.";
      }
    }
  });
  
}});

window.require.define({"models/template": function(exports, require, module) {
  // Template model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
    defaults: {
        name: ""
      , template: ""
      , build: ""
      , regions: { header: "default", footer: "default" }
    }

    , label: function () {
      for (i in this.standards) {
        if (this.get("name") === this.standards[i].name) {
          return this.standards[i].label;
        }
      }

      return this.get("name");
    }

    , setRegion: function (name, slug) {
      var regions = this.get("regions");
      regions[name] = slug;
      this.set("regions", regions);
    }

    , standards: [
        {
          name: "index"
        , label: "Default"
      }
      , {
          name: "front-page"
        , label: "Front Page"
      }
      , {
          name: "home"
        , label: "Blog"
      }
      , {
          name: "single"
        , label: "Article"
      }
      , {
          name: "page"
        , label: "Page"
      }
      , {
          name: "archive"
        , label: "Archive"
      }
      , {
          name: "search"
        , label: "Search Results"
      }
      , {
          name: "404"
        , label: "Error 404"
      }
    ]
  });
  
}});

window.require.define({"models/theme": function(exports, require, module) {
  // Theme model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
      idAttribute: "_id"
    , urlRoot: "/themes"

    , defaults: {
        name: ""
      , author: ""
      , screenshot_uri: ""
    }
  });
  
}});

window.require.define({"models/user": function(exports, require, module) {
  // User model class.
  var Model = require("models/base/model")
    , Themes = require("collections/themes");

  module.exports = Model.extend({
      defaults: {
        first_name: ""
      , last_name: ""
      , email: ""
      , password: ""
      , password_confirmation: ""
      , themes: []
    }

    , initialize: function() {
      var collection = new Themes(this.attributes.themes);
    }

    , url: "/users"

    , validation: {
      first_name: {
        required: true
      }
      , last_name: {
        required: true
      }
      , email: {
          required: true
        , pattern: "email"
      }
      , password: {
        required: function (value, attr, computed) {
          if (computed && !computed.id) {
            return true;
          }
          return false;
        }
      }
      , password_confirmation: {
        equalTo: "password"
      }
    }
  });
  
}});

window.require.define({"router": function(exports, require, module) {
  var app = require("application")
    , Themes = require("collections/themes");

  module.exports = Backbone.Router.extend({
    routes: {
        "": "index"
      , "me/themes": "your_themes"
      , "themes/:id": "theme"
      , "editor/:file": "editor"
      , "login": "login"
      , "register": "register"
      , "reset_password": "reset_password"
      , "upload": "upload"
      , "*actions": "notFound"
    }

    , index: function () {
      var collection = new Themes(app.data.themes)
        , alert = "";

      if (window.MutationSummary === void 0) {
        alert = "<div class='alert alert-error'>\
          Although the themes built with our online editor work in any browser,\
          the editor itself has been tested with the latest versions of\
          <a href=''>Google Chrome</a> and <a href=''>Mozilla Firefox</a> only.\
          Support for other browsers is coming soon.</div>";
      }

      $("#main").empty()
        .append(alert)
        .append(app.reuseView("faq").render().$el)
        .append(app.createView("theme_list", {collection: collection}).render().$el);
    }

    , your_themes: function () {
      var collection = new Themes(app.currentUser.get("themes"));

      $("#main").empty()
        .append("<h1 class='page-header'>Your Themes <small>(" + collection.length + ")</small></h1>")
        .append(app.createView("theme_list", {collection: collection}).render().$el);
    }

    , theme: function (id) {
      var themeView = app.createView("theme", {themeID: id});

      $("#main").empty().append(themeView.render().$el);

      // Add theme class to body
      $("body").addClass("theme");

      // Remove body class when navigating away from this route
      Backbone.history.on("route", function (e, name) {
        if (name !== "theme") {
          $("body").removeClass("theme");
        }
      });
    }

    , editor: function (id) {
      if (app.data.theme === void 0) {
        window.top.Backbone.history.navigate("/404", {trigger: true, replace: true});
        return;
      }

      // Initialize editor view
      app.createView("editor").render();

      // Setup drag and drop and resize
      app.createView("layout").render();
    }

    , login: function () {
      // Remove all modals and show the 'login' one
      // We could use modal("hide") here but it would trigger
      // events which we don't want
      $("body").removeClass("modal-open")
        .find(".modal, .modal-backdrop").remove().end()
        .append(app.createView("login").render().$el.modal("show"));
    }

    , register: function () {
      // Remove all modals and show the 'register' one
      // We could use modal("hide") here but it would trigger
      // events which we don't want
      $("body").removeClass("modal-open")
        .find(".modal, .modal-backdrop").remove().end()
        .append(app.createView("register").render().$el.modal("show"));
    }

    , reset_password: function () {
      // Remove all modals and show the 'reset_password' one
      // We could use modal("hide") here but it would trigger
      // events which we don't want
      $("body").removeClass("modal-open")
        .find(".modal, .modal-backdrop").remove().end()
        .append(app.createView("password_reset").render().$el.modal("show"));
    }

    , upload: function () {
      $("body").removeClass("modal-open")
        .find(".modal, .modal-backdrop").remove().end()
        .append(app.createView("theme_upload").render().$el.modal("show"));
    }

    , notFound: function () {
      $("#main").empty()
        .append(app.reuseView("not_found").render().$el);
    }
  });
  
}});

window.require.define({"views/auth_links": function(exports, require, module) {
  // Display the login and register links
  var View = require("views/base/view")
    , template = require("views/templates/auth_links")
    , app = require("application");

  module.exports = View.extend({
      el: $("#auth-links")
    , model: app.currentUser

    , events: {
      "click #logout": "deleteSession"
    }

    , initialize: function () {
      this.model.on("change", this.render, this);
    }

    , render: function () {
      var links = template({currentUser: this.model.toJSON()});

      this.$el.empty().append(links);

      return this;
    }

    // Send request to delete current user session
    // and redirect to homepage on success
    , deleteSession: function () {
      $.ajax({
          contentType: "application/json; charset=UTF-8"
        , dataType: "json"
        , type: "DELETE"
        , url: "/session"
        , complete: function (jqXHR, textStatus) {
          if (textStatus === "success") {
            window.location = "/";
          }
        }.bind(this)
      });
    }
  });
  
}});

window.require.define({"views/base/view": function(exports, require, module) {
  // Base class for all views.
  module.exports = Backbone.View.extend({
    render: function () {
      // If template attribute is set, render the template
      if (this.template) {
        this.$el.empty().append(require("views/templates/" + this.template)(this.data));
      }

      return this;
    }
  });
  
}});

window.require.define({"views/block_insert": function(exports, require, module) {
  // Display list of blocks to insert
  var View = require("views/base/view")
    , Blocks = require("collections/blocks")
    , app = require("application")
    , idIncrement = 1;

  module.exports = View.extend({
      id: "x-block-insert"
    , className: "x-section"
    , collection: app.blocks

    , events: {
        "draginit #x-block-insert .x-drag": "dragInit"
      , "dragend #x-block-insert .x-drag": "dragEnd"
    }

    , initialize: function () {
      this.collection.on("reset", this.addAll, this);
    }

    , render: function () {

      this.$el.empty().append("<p>Drag and drop to insert</p><ul class='x-rects'></ul>");

      this.collection.reset(this.collection.models);

      return this;
    }

    , addOne: function (block) {
      this.$("ul").append("<li><span class='x-drag' data-cid='" + block.cid + "'>\
                          <span>&Dagger;</span> " + block.label() + "</span></li>");
    }

    , addAll: function () {
      this.$("ul").empty();

      _.each(this.collection.models, function (block) {
        this.addOne(block);
      }, this);
    }

    // Replace the drag element by its clone
    , dragInit: function (e, drag) {
      drag.element = drag.ghost();
    }

    // If the element is inserted in a row,
    // load the actual template chuck to insert
    , dragEnd: function (e, drag) {
      if (drag.element.parent().hasClass("row")) {
        var block = this.collection.getByCid(drag.element.data("cid"));

        drag.element[0].outerHTML = "<div id='z-" + idIncrement + "' class='columns "
          + block.className() + "'>" + block.get("build") + "</div>";

        idIncrement++;
      }
    }
  });
  
}});

window.require.define({"views/download_button": function(exports, require, module) {
  var View = require("views/base/view")
    , Theme = require("models/theme")
    , app = require("application");

  module.exports = View.extend({
      id: "x-download-button"

    , events: {
        "click button.x-download": "download"
      , "click button.x-login": "login"
    }

    , initialize: function () {
      this.regions = app.regions;
      this.templates = app.templates;
    }

    , render: function () {
      var button;

      if (app.currentUser.id === void 0) {
        button = "<button class='x-btn x-btn-success x-login'>Login to Download</button>";
      } else {
        button = "<button class='x-btn x-btn-success x-download'>Download Theme</button>";
      }

      this.$el.empty().append(button);

      return this;
    }

    , login: function () {
      window.top.Backbone.history.navigate("/login", true);
    }

    , download: function (e) {
      var attrs, regions, templates;

      regions = _.map(this.regions.models, function (region) {
        return _.pick(region.attributes, "_id", "name", "slug", "template");
      });

      templates = _.map(this.templates.models, function (template) {
        return _.pick(template.attributes, "_id", "name", "template");
      });

      attrs = _.extend(app.data.theme, {
          regions: regions
        , templates: templates
      });
      e.target.setAttribute("disabled", "true");
      e.target.innerHTML = "Baking... Please wait.";

      app.trigger("download:before", attrs);

      (new Theme).save(attrs, {
        success: function (theme) {
          // Add Iframe with archive URL as src to trigger download
          var $iframe = $("#download-iframe", window.top.document);

          if ($iframe.length === 0) {
            $iframe = $("<iframe id='download-iframe' width='0' height='0' src='" + theme.get("archive") + "'></iframe>")
              .appendTo($("body", window.top.document));
          } else {
            $iframe.attr("src", theme.get("archive"));
          }

          e.target.removeAttribute("disabled");
          e.target.innerHTML = "Download Theme";

          app.trigger("download:after");

          window.top.Backbone.history.navigate("/themes/" + theme.id, true);
        }
        , error: function (theme, response) {
          app.trigger("notification", "error", "Sorry, we are unable to generate the theme archive. Please try again.");

          e.target.removeAttribute("disabled");
          e.target.innerHTML = "Download Theme";

          app.trigger("download:error");
        }
      });
    }
  });
  
}});

window.require.define({"views/editor": function(exports, require, module) {
  var app = require("application")
    , View = require("views/base/view");

  module.exports = View.extend({
    el: "<div id='x-layout-editor'>\
        <div class='x-handle'></div>\
        </div>"

    , events: {
        "draginit #x-layout-editor .x-handle": "dragInit"
      , "dragmove #x-layout-editor .x-handle": "dragMove"
      , "click h4": "showSection"
    }

    // Show editor when "templateLoaded" event is triggered
    , render: function () {
      this.$el
        .children(".x-handle").empty()
          .append("&Dagger; <span>Theme: " + app.data.theme.name + "</span>")
          .end()
        .append("<h4>Current Template <span>&and;</span></h4>")
        .append(app.reuseView("templates").render().$el);

      if (app.data.preview_only !== true) {
        this.$el
          .append("<h4>Header &amp; Footer <span>&and;</span></h4>")
          .append(app.reuseView("regions").render().$el)
          .append("<h4>Page Elements <span>&or;</span></h4>")
          .append(app.reuseView("block_insert").render().$el)
          .append("<h4>Style <span>&or;</span></h4>")
          .append(app.reuseView("style_edit").render().$el)
          .append("<h4>Share <span>&or;</span></h4>")
          .append(app.reuseView("share_link").render().$el)
          .append(app.reuseView("download_button").render().$el);

        app.reuseView("mutations");

        this.$(".x-section:not(#x-templates-select, #x-region-select)").hide();
      }

      this.$el.appendTo($("body"));

      return this;
    }

    , showSection: function (e) {
      $(e.target).next().slideToggle("slow", function () {
        var $this = $(this)
          , $handle = $this.prev().children("span").empty();

        if ($this.is(":hidden")) {
          $handle.append("&or;");
        } else {
          $handle.append("&and;");
        }
      });
    }

    // Drag the editor box
    , dragInit: function (e, drag) {
      var mouse = drag.mouseElementPosition;

      drag.representative($(drag.element).parent(), mouse.left(), mouse.top()).only();
    }

    // Keep the editor box above other elements when moving
    , dragMove: function (e, drag) {
      $(drag.element).parent().css("zIndex", 9999);
    }
  });
  
}});

window.require.define({"views/faq": function(exports, require, module) {
  var View = require("views/base/view");

  module.exports = View.extend({
      className: "well"
    , template: "faq"
  });
  
}});

window.require.define({"views/layout": function(exports, require, module) {
  var totalColumnsWidth, isRowFull
    , View = require("views/base/view")
    , app = require("application");

  // Return total width of all columns children of a row
  // except the one being dragged
  totalColumnsWidth = function (dropElement, dragElement) {
    return _.reduce($(dropElement).children(), function (memo, child) {
      if ($(child).is(dragElement)) {
        return memo;
      } else {
        return memo + $(child).outerWidth(true);
      }
    }, 0);

  };

  // Does total width of all columns children of a drop row
  // allow a new column?
  isRowFull = function (dropElement, dragElement) {
    var rowWidth = $(dropElement).width();

    return rowWidth <= totalColumnsWidth(dropElement, dragElement);
  };

  module.exports = View.extend({
      el: $("body")

    , currentAction: null

    , events: {
        // Highlight columns.
        "click .columns": "highlightColumns"

        // Links in columns shouldn't be clickable.
      , "click .columns a": "preventDefault"

        // Links and images in columns shoulnd't be draggable
      , "mousedown .columns a, .columns img": "preventDefault"

        // Forms shouldn't be submittable
      , "submit .columns form": "preventDefault"

        // Drag
      , "draginit .columns": "dragInit"
      , "dragend .columns": "dragEnd"

        // Drop
      , "dropover .row": "dropOver"
      , "dropout .row": "dropOut"
      , "dropon .row": "dropOn"

        // Resize
      , "draginit .x-resize": "resizeInit"
      , "dragmove .x-resize": "resizeMove"
      , "dragend .x-resize": "resizeEnd"

        // Remove column
      , "click .columns .x-remove": "removeColumn"
    }

    , initialize: function () {
      _.bindAll(this, "addDataBypass", "removeDataBypass");

      this.addDataBypass();
      app.on("download:before", this.removeDataBypass);
      app.on("download:after", this.addDataBypass);
      app.on("download:error", this.addDataBypass);
    }

    , removeDataBypass: function () {
      this.$(".columns a").removeAttr("data-bypass");
    }

    , addDataBypass: function () {
      this.$(".columns a").attr("data-bypass", true);
    }

    , preventDefault: function (e) {
      e.preventDefault();
    }

    // Remove .x-current from previously highlighted column and add to current one.
    // Add resize and delete handles to the column if they weren't there already.
    , highlightColumns: function (e) {
      if (this.currentAction !== null) {
        return;
      }

      app.trigger("editor:columnHighlight", e.currentTarget);

      var $column = $(e.currentTarget);

      this.$(".columns.x-current").removeClass("x-current");
      $column.addClass("x-current")

      if ($column.children(".x-resize").length === 0) {
        $column.html(function (i, html) {
          return html + "<div class='x-resize' title='Resize element'>&harr;</div>";
        });
      }

      if ($column.children(".x-remove").length === 0) {
        $column.html(function (i, html) {
          return html + "<div class='x-remove' title='Remove element'>&times;</div>";
        });
      }

    }

    // Start drag and limit it to direct children of body.
    // If released, revert to original position.
    , dragInit: function (e, drag) {
      this.currentAction = "drag";

      drag.limit(this.$el.children()).revert();
    }

    // Reset position of dragged element.
    , dragEnd: function (e, drag) {
      $(drag.element).css({
        top: drag.startPosition.top() + "px",
        left: drag.startPosition.left() + "px"
      });

      this.currentAction = null;
    }

    // Mark the row as full or not.
    , dropOver: function (e, drop, drag) {
      $(drop.element).addClass(function () {
        if (isRowFull(this, drag.element)) {
          $(this).addClass("x-full");
        } else {
          $(this).addClass("x-not-full");
        }
      });
    }

    // Remove x-full or x-not-full class if previously added.
    , dropOut: function (e, drop, drag) {
      $(drop.element).removeClass("x-full x-not-full");
    }

    // Add column to row. If the row is full, add a new row.
    // If original parent row doesn't have any more children
    // and is not a <header> or <footer> and has no id attribute, remove it.
    // Remove x-full and x-not-full classes if one was previously added.
    , dropOn: function (e, drop, drag) {
      var row, $drag, $dragParent, $dragGrandParent;

      $drag = $(drag.element);
      $drop = $(drop.element);

      $dragParent = $drag.parent();

      if (isRowFull($drop, $drag)) {
        $row = $("<div class='row'></div>").insertAfter($drop);
      } else {
        $row = $drop;
      }
      $drag.appendTo($row);

      $drop.removeClass("x-empty");

      if ($dragParent.children().length === 0 ) {
        $dragGrandParent = $dragParent.parent();

        if (($dragGrandParent.is("header, footer") && $dragGrandParent.children().length === 1)
            && $dragParent.attr("id").indexOf("x-") !== 0) {
          $dragParent.addClass("x-empty");
        } else {
          $dragParent.remove();
        }
      }

      $drop.removeClass("x-full x-not-full");
    }

    // Init drag of resize handle horizontally and don't notify drops.
    , resizeInit: function (e, drag) {
      this.currentAction = "resize";

      drag.horizontal().only();
    }

    // Resize the column.
    // Sum of column widths in the row should never be larger than row.
    , resizeMove: function (e, drag) {
      var $drag = $(drag.element)
      , $column = $drag.parent()
      , $row = $column.parent();

      width = drag.location.x() + $drag.width() / 2 - $column.offset().left;

      if (width >= $row.width()) {
        width = $row.width();
        e.preventDefault();
      } else if (width >= $row.width() - totalColumnsWidth($row, $column)) {
        width = $row.width() - totalColumnsWidth($row, $column);
        // When width is a float, calculation is incorrect because browsers use integers
        // The following line fixes that. Replace as soon as you find a cleaner solution
        width = width - 1
        e.preventDefault();
      }

      $column.width(width);
      drag.position(new $.Vector(width - $drag.width() / 2 + $column.offset().left, drag.location.y()));
    }

    // Reset position of resize handle
    , resizeEnd: function (e, drag) {
      $(drag.element).css({
        position: "absolute"
        , right: "-12px"
        , left: "auto"
      });

      this.currentAction = null;
    }

    // Remove column if confirmed.
    , removeColumn: function (e) {
      if (confirm("Are you sure you want to remove this element?")) {
        $(e.currentTarget).parent().remove();
      }
    }
  });
  
}});

window.require.define({"views/login": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      className: "modal"
    , template: "login"
    , model: app.currentUser

    , events: {
      "submit form": "loginUser"
    }

    , loginUser: function (e) {
      e.preventDefault();

      if (this.validateInputs()) {
        this.submitData();
      }
    }

    , validateInputs: function () {
      var valid = true;

      this.$("input").each(function (i, element) {
        var attr = element.getAttribute("name");

        if (element.value === "") {
          var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " can't be blank";
          Backbone.Validation.callbacks.invalid(this, attr, msg, "name");

          valid = false;
        }
      }.bind(this));

      return valid;
    }

    , submitData: function () {
      var data = {};

      this.$("input").each(function (i, element) {
        var attr = element.getAttribute("name");

        data[attr] = element.value;
      });

      $.ajax({
          contentType: "application/json;charset=UTF-8"
        , dataType: "json"
        , type: "POST"
        , url: "/session"
        , data: JSON.stringify(data)
        , complete: function (jqXHR, textStatus) {
          var response = JSON.parse(jqXHR.responseText);

          switch (textStatus) {
            case "success":
              this.model.set(response);

              this.$el.modal("hide");

              app.trigger("notification", "success", "Welcome back, " + this.model.get("first_name") + ".");
            break;

            case "error":
              var form = this.$("form");

              if (form.children(".alert-error").length === 0) {
                form.prepend("<p class='alert alert-error'>" + response.error + "</p>");
              }
            break;
          }
        }.bind(this)
      });
    }
  });
  
}});

window.require.define({"views/mutations": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application")
    , idIncrement = 1; // For temporary ids when inserting rows.

  module.exports = View.extend({
    initialize: function () {
      _.bindAll(this);
      window.addEventListener("DOMContentLoaded", this.observeMutations);

      app.on("templateLoad", this.stopObserving);
      app.on("templateLoaded", this.restartObserving);

      app.on("regionLoad", this.stopObserving);
      app.on("regionLoaded", this.restartObserving);
    }

    , stopObserving: function () {
      this.observer.disconnect();
    }

    , restartObserving: function () {
      this.observer.reconnect();
    }

    , observeMutations: function () {
      this.observer = new MutationSummary({
          rootNode: $("body")[0]
        , queries: [{all: true}]
        , callback: this.propagateMutations
      });
    }

    , propagateMutations: function (summaries) {
      var isColumn
        , summary = summaries[0];

      isColumn = function (node) {
        return node.className && node.className.indexOf("column") !== -1;
      };

      summary.added.forEach(function (node) {
        if (isColumn(node)) {
          this.addNode(node);
        }
      }.bind(this));

      summary.removed.forEach(function (node) {
        if (isColumn(node)) {
          this.removeNode(node, summary.getOldParentNode(node));
        }
      }.bind(this));

      summary.reparented.forEach(function (node) {
        if (isColumn(node)) {
          this.reparentNode(node, summary.getOldParentNode(node));
        }
      }.bind(this));

      summary.reordered.forEach(function (node) {
        if (isColumn(node)) {
          this.reorderNode(node, summary.getOldPreviousSibling(node));
        }
      }.bind(this));
    }

    , addNode: function (node) {
      var grandParentNode, region, template, row, sandbox, block, blockClassName, sibling, templateClone;

      // copy of the node that will be inserted
      copy = node.cloneNode(true);

      grandParentNode = node.parentNode.parentNode;

      if (["HEADER", "FOOTER"].indexOf(grandParentNode.tagName) !== -1) {
        piece = app.regions.getByName(grandParentNode.tagName.toLowerCase());

        piece.set("build", grandParentNode.outerHTML);
      } else {
        piece = app.templates.getCurrent();

        templateClone = window.document.getElementById("page").cloneNode(true);
        $(templateClone).children("header, footer").remove();
        piece.set("build", templateClone.innerHTML);
      }

      sandbox = (new DOMParser).parseFromString(piece.get("template"), "text/html");

      // Get destination row.
      row = sandbox.getElementById(node.parentNode.id);

      // If the destination node doesn't exist in the template, create it.
      if (!row) {
        row = sandbox.createElement("div");
        row.className = "row";
        row.id = "y-" + idIncrement;
        idIncrement++;

        // Set the ID of the row the user sees
        node.parentNode.id = row.id
      }

      // Replace node innerHTML by Handlebars tag
      for (var i in app.blocks.models) {
        block = app.blocks.models[i];

        if (node.className.indexOf(block.className()) !== -1) {
          copy.innerHTML = block.tag();
          break;
        }
      }

      // Insert the node in the row
      if (node.nextElementSibling) {
        sibling = sandbox.getElementById(node.nextElementSibling.id);
        row.insertBefore(copy, sibling);
      } else {
        row.appendChild(copy);
      }

      // Insert the row in the template.
      // If the next sibling of the node is the footer region,
      // insert the row at the end.
      if (node.parentNode.nextElementSibling) {
        if ("FOOTER" === node.parentNode.nextElementSibling.tagName) {
          sandbox.body.innerHTML = sandbox.body.innerHTML + row.outerHTML;
        } else {
          nextRow = sandbox.getElementById(node.parentNode.nextElementSibling.id);
          if (nextRow.parentNode) {
            nextRow.parentNode.insertBefore(row, nextRow);
          }
        }
      } else {
        sandbox.getElementById(grandParentNode.id).appendChild(row);
      }

      piece.set("template", sandbox.body.innerHTML);
    }

    , removeNode: function (node, oldParentNode) {
      var oldGrandParentNode, parentNode;

      oldGrandParentNode = oldParentNode.parentNode;

      // If grandparent is header or footer, remove from corresponding region template.
      // If not, remove from template
      if (["HEADER", "FOOTER"].indexOf(oldGrandParentNode.tagName) !== -1) {
        piece = app.regions.getByName(oldGrandParentNode.tagName.toLowerCase());

        piece.set("build", oldGrandParentNode.outerHTML);
      } else {
        piece = app.templates.getCurrent();

        templateClone = window.document.getElementById("page").cloneNode(true);
        $(templateClone).children("header, footer").remove();
        piece.set("build", templateClone.innerHTML);
      }

      sandbox = (new DOMParser).parseFromString(piece.get("template"), "text/html");

      parentNode = sandbox.getElementById(oldParentNode.id);

      // If parent node doesn't have anymore children, remove it
      // If not, simply remove the node
      if (oldParentNode.children.length === 0) {
        if (parentNode.parentNode) {
          parentNode.parentNode.removeChild(parentNode);
        }
      } else {
        parentNode.removeChild(sandbox.getElementById(node.id));
      }

      piece.set("template", sandbox.body.innerHTML);
    }

    , reparentNode: function (node, oldParentNode) {
      this.addNode(node);
      // Remove node if it was in a different region
      if (oldParentNode.parentNode !== null) {
        this.removeNode(node, oldParentNode);
      }
    }

    , reorderNode: function (node, oldPreviousSibling) {
      this.addNode(node);
    }
  });
  
}});

window.require.define({"views/not_found": function(exports, require, module) {
  var View = require("views/base/view");

  module.exports = View.extend({
      id: "not-found"
    , template: "not_found"
  });
  
}});

window.require.define({"views/notifications": function(exports, require, module) {
  // Notifications view
  // Show all notifications in an ul
  // Listen to notification events to render a notification and append it to the ul
  // Hide the notification after 4s
  var app = require("application")
    , View = require("views/base/view")
    , template = require("views/templates/notification");

  module.exports = View.extend({
      tagName: "ul"
    , id: "notifications"
    , className: "unstyled"

    , initialize: function () {
      _.bindAll(this, "showNotification");

      app.on("notification", this.showNotification);
    }

    , showNotification: function (type, text) {
      var $li = $(template({type: type, text: text})).appendTo(this.$el);

      setTimeout(function () {
        $li.alert("close");
      }, 4000);

      return this;
    }
  });
  
}});

window.require.define({"views/password_reset": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      className: "modal"
    , template: "password_reset"
    , model: app.currentUser

    , events: {
      "submit form": "initiatePasswordReset"
    }

    , initiatePasswordReset: function (e) {
      e.preventDefault();

      if (this.validateInputs()) {
        this.initiateReset();
      }
    }

    , validateInputs: function () {
      var valid = true;

      this.$("form input").each(function (i, element) {
        var attr = element.getAttribute("name");

        if (element.value === "") {
          var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " can't be blank";
          Backbone.Validation.callbacks.invalid(this, attr, msg, "name");

          valid = false;
        }
      }.bind(this));

      return valid;
    }

    , initiateReset: function () {
      var data = {
          email: this.$("input[name=email]")[0].value
        , password: this.$("input[name=password]")[0].value
      };

      $.ajax({
          contentType: "application/json;charset=UTF-8"
        , dataType: "json"
        , type: "POST"
        , url: "/users/reset_password"
        , data: JSON.stringify(data)
        , complete: function (jqXHR, textStatus) {
          switch (textStatus) {
            case "success":
              this.$el.modal("hide");

              app.trigger("notification", "success", "We have sent you an email with a link to confirm your new password.");
            break;

            case "error":
            break;
          }
        }.bind(this)
      });
    }
  });
  
}});

window.require.define({"views/regions": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/regions")
    , app = require("application")
    , Region = require("models/region");

  module.exports = View.extend({
      id: "x-region-select"
    , className: "x-section"
    , collection: app.regions

    , events: {
        "change .x-header-select, .x-footer-select": "switchRegion"
      , "click .x-header-new button, .x-footer-new button": "addRegion"
    }

    , initialize: function () {
      this.template = app.templates.getCurrent();

      this.collection.on("add", this.addOne, this);
    }

    , render: function () {
      this.$el.empty().append(template({
          headers: this.collection.where({name: "header"}).map(function (header) { return header.attributes; })
        , footers: this.collection.where({name: "footer"}).map(function (footer) { return footer.attributes; })
      }));

      this.$(".x-header-new, .x-footer-new").hide();

      return this;
    }

    , switchRegion: function (e) {
      var name, slug, region;

      if (e.target.className.indexOf("header") != -1) {
        name = "header";
      } else {
        name = "footer";
      }

      slug = $(e.target).val();

      this.toggleForm(name, slug);

      if (slug) {
        this.loadRegion(this.collection.getByName(name, slug));
      }
    }

    , toggleForm: function (name, slug) {
      if (slug) {
        this.$(".x-" + name + "-new").hide("slow");
      } else {
        this.$(".x-" + name + "-new").show("slow");
      }
    }

    , loadRegion: function (region) {
      var name = region.get("name")
        , slug = region.get("slug");

      app.trigger("regionLoad", region);

      this.template.setRegion(name, slug);

      $("#page").children(name)[0].outerHTML = region.get("build");
      $("#page").children(name).fadeOut().fadeIn();

      app.trigger("regionLoaded", region);
    }

    , addRegion: function (e) {
      var name, slug, region, $element;

      if (e.currentTarget.className.indexOf("header") != -1) {
        name = "header";
      } else {
        name = "footer";
      }

      slug = _.str.slugify(this.$(".x-" + name + "-new input").val());

      if (!slug) {
        app.trigger("notification", "error", "Please, enter a " + name + " name.");
        return;
      }

      attributes = _.pick(this.collection.getByName(name).attributes, "name", "template", "build");
      attributes.slug = slug;

      region = new Region(attributes);
      this.collection.add(region);
      this.loadRegion(region);

      $(e.currentTarget).parent().hide("slow");

      app.trigger("notification", "success", "The new " + name + " was created. It's a copy of the default one.");
    }

    , addOne: function (region) {
      var slug;

      slug = region.get("slug");

      this.$(".x-" + region.get("name") + "-select")
        .children(":selected").removeAttr("selected").end()
        .children("[value='']")
          .before("<option value='" + slug + "' selected='selected'>" + slug + "</option>");
    }
  });
  
}});

window.require.define({"views/register": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      className: "modal"
    , template: "register"
    , model: app.currentUser

    , events: {
      "submit form": "createUser"
    }

    , initialize: function () {
      Backbone.Validation.bind(this);
    }

    // Create current user from form input values and submit to the server.
    // Handle error messages from server.
    // Hide modal on success.
    , createUser: function (e) {
      e.preventDefault();

      var user = this.model
        , attrs = {};

      this.$("input").each(function () {
        attrs[this.getAttribute("name")] = this.value;
      });

      user.save(attrs, {
        success: function (model, res) {
          model.set(res);

          app.trigger("notification", "success", "Your registration was successful. You are now logged in.");

          this.$el.modal("hide");
        }.bind(this)

        , error: function (model, err) {
          this.displayServerErrors(err);
        }.bind(this)
      });
    }

    , displayServerErrors: function (err) {
      if (! err.responseText) {
        return;
      }

      var msgs = JSON.parse(err.responseText);

      Object.keys(msgs).forEach(function (attr) {
        var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " " + msgs[attr][0];
        Backbone.Validation.callbacks.invalid(this, attr, msg, "name");
      }.bind(this));
    }
  });
  
}});

window.require.define({"views/share_link": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      id: "x-share-link"
    , className: "x-section"
    , template: "share_link"
    , data: {
      theme: app.data.theme._id
    }
  });
  
}});

window.require.define({"views/style_edit": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/style_edit")
    , app = require("application")
    , CustomCSS = require("lib/custom_css");

  module.exports = View.extend({
      id: "x-style-edit"
    , className: "x-section"

    , events: {
        "click button": "addInputs"
      , "keyup input[name=value]": "addStyle"
      , "blur input[name=value]": "addStyle"
      , "change input[name=value]": "addStyle"
    }

    , initialize: function () {
      _.bindAll(this, "setSelector", "buildDownload");

      app.on("editor:columnHighlight", this.setSelector);
      app.on("download:before", this.buildDownload);

      this.customCSS = new CustomCSS(app.data.style);
    }

    , setSelector: function (element) {
      this.selector = "#" + element.id;
      this.render();
    }

    , render: function () {
      var rules;

      if (!this.selector) {
        this.$el.html("Click on an element in the design to customize it.");
        return this;
      }

      rules = _.map(this.customCSS.rules[this.selector], function (rule, property) {
        rule.property = property;
        return rule;
      });

      this.$el.html(template({
          selector: this.selector
        , rules: rules
      }));

      return this;
    }

    , addInputs: function (e) {
      e.preventDefault();

      this.$("ul").append("<li><input name='property' value='' placeholder='property' />: \
                          <input name='value' value='' placeholder='value' /></li>");
    }

    , addStyle: function (e) {
      var property, value;

      value = e.target.value;

      property  = $(e.target).siblings("input[name=property]").val();

      this.customCSS.insertRule(this.selector, property, value);
    }

    , buildDownload: function (attributes) {
      attributes.style = this.customCSS.rules;
    }
  });
  
}});

window.require.define({"views/templates": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application")
    , Template = require("models/template")
    , template = require("views/templates/templates");

  module.exports = View.extend({
      id: "x-templates-select"
    , className: "x-section"
    , collection: app.templates

    , events: {
        "change ul input": "switchTemplate"
      , "focus ul input": "switchTemplate"
      , "blur ul input": "switchTemplate"
      , "click .x-remove": "removeTemplate"
      , "click .x-new-template": "showForm"
      , "change .x-new-template-select select": "selectTemplate"
      , "click .x-new-template-add": "addTemplate"
    }

    , initialize: function (options) {
      this.collection.on("add", this.addOne, this);
      this.collection.on("reset", this.addAll, this);
      this.collection.on("remove", this.removeOne, this);
    }

    , render: function () {
      var standards = _.reject((new Template).standards, function (standard) {
        return !!this.collection.getByName(standard.name);
      }.bind(this));

      this.$el.empty().append(template({standards: standards}));

      this.collection.reset(this.collection.models);

      return this;
    }

    , addOne: function (template) {
      var checked = current = remove = "";

      if (template.cid === this.collection.getCurrent().cid) {
        checked = " checked='checked'";
        current = " class='x-current'";
      }

      if (template.get("name") != "index") {
        remove = "<span class='x-remove' title='Delete template'>&times;</span>";
      }

      this.$("ul").append("<li" + current + "><label><input name='x-template'" + checked
                          + " type='radio' value='" + template.cid + "' />"
                          + template.label() + "</label>" + remove + "</li>");
    }

    , addAll: function () {
      this.$("ul").empty();

      _.each(this.collection.models, function (template) {
        this.addOne(template);
      }, this);
    }

    , removeOne: function (template) {
      this.$("input[value='" + template.cid + "']").closest("li").remove();
    }

    , switchTemplate: function () {
      var template = this.collection.getByCid(this.$("ul input:checked").val());

      this.$("ul li").removeClass("x-current");
      this.$("ul input:checked").closest("li").addClass("x-current");

      this.loadTemplate(template);
    }

    // Save current template, display it and trigger templateLoaded event
    , loadTemplate: function (template) {
      var header, footer, regions;

      app.trigger("templateLoad", template);

      regions = template.get("regions");

      header = app.regions.getByName("header", regions.header);
      footer = app.regions.getByName("footer", regions.footer);

      build = header.get("build") + template.get("build") + footer.get("build");

      $("#page").fadeOut().empty().append(build).fadeIn();

      this.collection.setCurrent(template);

      app.trigger("templateLoaded", template);
    }

    // Remove column if confirmed.
    , removeTemplate: function (e) {
      if (confirm("Are you sure you want to delete this template?")) {
        var cid = $(e.currentTarget).parent().find("input").val();
        this.collection.remove(cid);
      }
    }

    , showForm: function (e) {
      var $div = this.$(".x-new-template-select");

      if ($div.is(":hidden")) {
        $div.show("normal");
      } else {
        $div.hide("normal");
      }
    }

    , selectTemplate: function (e) {
      if ($(e.currentTarget).val() === "") {
        this.$(".x-new-template-name").show();
      } else {
        this.$(".x-new-template-name").hide();
      }
    }

    , addTemplate: function () {
      var name, attributes, template;

      name = this.$(".x-new-template-select select").val()
                        || this.$(".x-new-template-name").val();

      if (!name) {
        app.trigger("notification", "error", "Please, enter a template name.");
        return;
      }

      attributes = _.pick(this.collection.getByName("index").attributes,
                          "template", "build", "regions");
      attributes.name = name;

      template = new Template(attributes);
      this.collection.add(template);
      this.collection.setCurrent(template);
      this.render();

      app.trigger("notification", "success", "The new template was created. It's a copy of the default one.");
    }
  });
  
}});

window.require.define({"views/templates/auth_links": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this;

  function program1(depth0,data) {
    
    
    return "\n  <ul class=\"nav\">\n    <li><a href=\"/me/themes\" id=\"your_themes\">Your themes</a></li>\n    <li><a href=\"/upload\" id=\"upload_theme\">Upload</a></li>\n  </ul>\n  <button class=\"btn\" id=\"logout\">Log out</button>\n";}

  function program3(depth0,data) {
    
    
    return "\n  <ul class=\"nav\">\n    <li><a id=\"register\" href=\"/register\">Register</a></li>\n    <li><a id=\"login\" href=\"/login\">Log in</a></li>\n  </ul>\n";}

    foundHelper = helpers.currentUser;
    stack1 = foundHelper || depth0.currentUser;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.id);
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(3, program3, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n";
    return buffer;});
}});

window.require.define({"views/templates/faq": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"page-header\">\n  <h1>\n    Online Theme Editor\n    <small>exports to HTML and WordPress themes</small>\n  </h1>\n</div>\n<p class=\"lead\">Cook your <i class=\"icon-ok\"></i> standard compliant,\n<i class=\"icon-ok\"></i> responsive,  <i class=\"icon-ok\"></i> semantic,\n[<i class=\"icon-ok\"></i> insert any buzzword here ;)] <i class=\"icon-ok\"></i> HTML5 theme\nin a few minutes with our easy to use drag and drop editor.</p>\n<p>Start by choosing a preset theme below.\n(<a data-toggle=\"collapse\" data-bypass=\"true\" href=\"#faq\">FAQ</a>)</p>\n\n<div id=\"faq\" class=\"collapse\">\n  <h3>Frequently Asked Questions</h3>\n  <h4>How it works?</h4>\n  <ul>\n    <li>Scroll down the page to see the full list of all the themes and choose the one you like.</li>\n    <li>When you find the theme you want, click the \"Customize\" button and you will be taken\n    to the customizer where you can make edits until you are satisfied.</li>\n    <li>Then, click on \"Download\" to download the WordPress theme with your customizations included.</li>\n  </ul>\n  <h4>Something doesn't work. What should I do?</h4>\n  <p>It is our fault and we are sorry for that. This site is a work in progress and\n  we are building new features and fixing bugs every day. Please contact us if something doesn't work for you\n  and we will quickly find a solution.</p>\n\n  <p><a data-toggle=\"collapse\" data-bypass=\"true\" href=\"#faq\"><i class=\"icon-arrow-up\"></i> Hide</a></p>\n</div>\n";});
}});

window.require.define({"views/templates/login": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Please authenticate yourself</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"email\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" name=\"password\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Log In</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Forgot your password? <a href=\"/reset_password\" data-replace=\"true\">Reset password</a></li>\n    <li>Don't have an account yet? <a href=\"/register\" data-replace=\"true\">Register</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/not_found": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<h1 class=\"page-header\">Ooops! We screwed up. :(</h1>\n<p class=\"lead\">Sorry, the page you were looking for doesn’t exist.</p>\n<p>Go back to <a href=\"/\" title=\"thememy.com\">homepage</a> or contact us about a problem.</p>\n";});
}});

window.require.define({"views/templates/notification": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<li class=\"alert alert-";
    foundHelper = helpers.type;
    stack1 = foundHelper || depth0.type;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "type", { hash: {} }); }
    buffer += escapeExpression(stack1) + " fade in\"><button class=\"close\" data-dismiss=\"alert\">×</button> ";
    foundHelper = helpers.text;
    stack1 = foundHelper || depth0.text;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</li>\n";
    return buffer;});
}});

window.require.define({"views/templates/password_reset": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Reset password</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\" id=\"password_reset\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"email\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"password\">New Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" name=\"password\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Send reset email</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Remember your password? <a href=\"/login\" data-replace=\"true\">Log in</a></li>\n    <li>Don't have an account yet? <a href=\"/register\" data-replace=\"true\">Register</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/regions": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  <option value=\"";
    foundHelper = helpers.slug;
    stack1 = foundHelper || depth0.slug;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.slug;
    stack1 = foundHelper || depth0.slug;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n  ";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  <option value=\"";
    foundHelper = helpers.slug;
    stack1 = foundHelper || depth0.slug;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.slug;
    stack1 = foundHelper || depth0.slug;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n  ";
    return buffer;}

    buffer += "<label>Header:</label>\n<select class=\"x-header-select\">\n  ";
    foundHelper = helpers.headers;
    stack1 = foundHelper || depth0.headers;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <option value=\"\">new header</option>\n</select>\n<div class=\"x-header-new\">\n  <input type=\"text\" value=\"\" placeholder=\"Enter header name\" />\n  <button class=\"x-header-add\">Add</button>\n</div>\n\n<label>Footer:</label>\n<select class=\"x-footer-select\">\n  ";
    foundHelper = helpers.footers;
    stack1 = foundHelper || depth0.footers;
    stack2 = helpers.each;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <option value=\"\">new footer</option>\n</select>\n<div class=\"x-footer-new\">\n  <input type=\"text\" value=\"\" placeholder=\"Enter footer name\" />\n  <button class=\"x-footer-add\">Add</button>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/register": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Create an account</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-first-name\">First Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"first_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-last-name\">Last Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"last_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"email\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" class=\"input-xlarge\" name=\"password\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password-confirmation\">Password Confirmation</label>\n        <div class=\"controls\">\n          <input type=\"password\" class=\"input-xlarge\" name=\"password_confirmation\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary submit\">Register</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Already have an account? <a href=\"/login\" data-replace=\"true\">Log in</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/share_link": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<p>http://thememy.com/themes/";
    foundHelper = helpers.theme;
    stack1 = foundHelper || depth0.theme;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "theme", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</p>\n";
    return buffer;});
}});

window.require.define({"views/templates/style_edit": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n    <li><input name=\"property\" value=\"";
    foundHelper = helpers.property;
    stack1 = foundHelper || depth0.property;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "property", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />: <input name=\"value\" value=\"";
    foundHelper = helpers.value;
    stack1 = foundHelper || depth0.value;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "value", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" /></li>\n    ";
    return buffer;}

    buffer += "<form>\n  <p class=\"x-choice\">\n    <label>Current Element:</label>\n    <b>";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth0.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</b>\n  </p>\n  <ul class=\"x-rules\">\n    ";
    foundHelper = helpers.rules;
    stack1 = foundHelper || depth0.rules;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </ul>\n  <button>Add custom style</button>\n</form>\n";
    return buffer;});
}});

window.require.define({"views/templates/templates": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n      <option value=\"";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.label;
    stack1 = foundHelper || depth0.label;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n      ";
    return buffer;}

    buffer += "<p>Click to change</p>\n<ul class=\"x-rects\"></ul>\n<button class=\"x-new-template\">&plus; New Template</button>\n<div class=\"x-new-template-select\">\n  <label>Choose:\n    <select>\n      ";
    foundHelper = helpers.standards;
    stack1 = foundHelper || depth0.standards;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      <option value=\"\">Other</option>\n    </select>\n  </label>\n  <input class=\"x-new-template-name\" type=\"text\" value=\"\" placeholder=\"Enter template name\" />\n  <button class=\"x-new-template-add\">Add</button>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<iframe id=\"theme\" name=\"theme\" src=\"/editor/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" frameborder=\"0\" width=\"100%\" height=\"100%\"></iframe>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme_list": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<li class=\"span3\">\n  <div class=\"thumbnail\">\n    <a href=\"/themes/";
    foundHelper = helpers._id;
    stack1 = foundHelper || depth0._id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"><img src=\"";
    foundHelper = helpers.screenshot_uri;
    stack1 = foundHelper || depth0.screenshot_uri;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "screenshot_uri", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" alt=\"\"></a>\n    <div class=\"caption\">\n      <h4>";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\n      <p>by <a href=\"#\">";
    foundHelper = helpers.author;
    stack1 = foundHelper || depth0.author;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "author", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></p>\n      <div>\n        <a class=\"btn btn-primary pull-right\" href=\"/themes/";
    foundHelper = helpers._id;
    stack1 = foundHelper || depth0._id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"><i class=\"icon-pencil icon-white\"></i> Customize</a>\n      </div>\n    </div>\n  </div>\n</li>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme_upload": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Upload a new theme</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"file\">Theme Archive</label>\n        <div class=\"controls\">\n          <input type=\"file\" name=\"file\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Upload Theme</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n</div>\n";});
}});

window.require.define({"views/theme": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/theme")
    , application = require("application");

  module.exports = View.extend({
    render: function () {
      this.$el.empty()
        .append(template({id: this.options.themeID}));

      return this;
    }
  });
  
}});

window.require.define({"views/theme_list": function(exports, require, module) {
  var View = require("views/base/view")
    , Themes = require("collections/themes")
    , template = require("views/templates/theme_list")
    , app = require("application");

  module.exports = View.extend({
      el: $("<ul class='thumbnails'></ul>")

    , initialize: function () {
      this.bindEvents();
    }

    , render: function () {
      this.collection.reset(this.collection.models);

      return this;
    }

    , bindEvents: function () {
      this.collection.on("reset", this.addAll, this);
    }

    , addOne: function (theme) {
      this.$el.append(template(theme.toJSON()));
    }

    , addAll: function () {
      this.$el.empty();

      this.collection.each(function (theme) {
        this.addOne(theme);
      }, this);
    }
  });
  
}});

window.require.define({"views/theme_upload": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      className: "modal"
    , template: "theme_upload"

    , events: {
      "submit form": "sendFormData"
    }

    , sendFormData: function (e) {
      var $form = this.$("form")
        , button = this.$("button[type=submit]")[0];

      e.preventDefault();

      button.setAttribute("disabled", "true");
      button.innerHTML = "Uploading... Please wait.";

      $form.children(".alert-error").remove();

      $.ajax({
          type: "POST"
        , url: "/themes"
        , data: new FormData($form[0])
        , success: function (data, textStatus, jqXHR) {
          // Remove modal without evant
          $("body").removeClass("modal-open")
            .find(".modal, .modal-backdrop").remove();

          app.trigger("notification", "success", "Your theme is uploaded and ready to be customized!");

          Backbone.history.navigate("/themes/" + data._id, true);
        }.bind(this)

        , error: function (jqXHR, textStatus, errorThrown) {
          var response = JSON.parse(jqXHR.responseText);

          for (i in response) {
            $form.prepend("<p class='alert alert-error'>" + response[i] + "</p>");
          }

          button.removeAttribute("disabled");
          button.innerHTML = "Upload Theme";
        }

        , cache: false
        , contentType: false
        , dataType: "json"
        , processData: false
      });
    }
  });
  
}});

