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
          this.currentTheme.set("css", new CustomCSS(this.data.style));
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

    , getByName: function (name) {
      return this.find(function (block) {
        return block.get("name") === name;
      });
    }
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

      if (!current) {
        current = this.getByName("index");
      }

      return current;
    }

    // Save template being edited
    , setCurrent: function (template) {
      var oldCurrent= this.getCurrent();

      if (oldCurrent) {
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
  var app = require('application');

  jQuery(function($) {
    app.initialize();

    // Enable HTML5 pushstate
    Backbone.history.start({pushState: true});

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router if the user is not on the homepage.
    // If the link has a `data-bypass` attribute, bypass the delegation completely.
    // If the link has a `data-replace` attribute, update the URL without creating
    // an entry in the browser history.
    $(window.top.document).on("click", "a:not([data-bypass])", function(e) {
      var href = { prop: $(this).prop("href"), attr: $(this).attr("href") }
      , root = location.protocol + "//" + location.host + "/";

      if (href.attr === "#") {
        return;
      }

      if (href.prop && href.prop.slice(0, root.length) === root &&
         Backbone.history.fragment !== "") {
        e.preventDefault();

        Backbone.history.navigate(href.attr, {
          trigger: true,
          replace: !!$(this).data("replace")
        });
      }
    });

    // Google Analytics
    Backbone.history.on("route", function (name, args) {
      if ("_gaq" in window) {
        var url = "/" + this.getFragment();
        _gaq.push(["_trackPageview", url]);
      }
    });
  });
  
}});

window.require.define({"lib/css_properties": function(exports, require, module) {
  // List of all CSS properties
  // Used for autocomplete
  module.exports = [
    "align-content",
    "align-items",
    "align-self",
    "alignment-adjust",
    "alignment-baseline",
    "anchor-point",
    "animation",
    "animation-delay",
    "animation-direction",
    "animation-duration",
    "animation-fill-mode",
    "animation-iteration-count",
    "animation-name",
    "animation-play-state",
    "animation-timing-function",
    "appearance",
    "azimuth",
    "backface-visibility",
    "background",
    "background-attachment",
    "background-clip",
    "background-color",
    "background-image",
    "background-origin",
    "background-position",
    "background-repeat",
    "background-size",
    "baseline-shift",
    "binding",
    "bleed",
    "bookmark-label",
    "bookmark-level",
    "bookmark-state",
    "bookmark-target",
    "border",
    "border-bottom",
    "border-bottom-color",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
    "border-bottom-style",
    "border-bottom-width",
    "border-collapse",
    "border-color",
    "border-image",
    "border-image-outset",
    "border-image-repeat",
    "border-image-slice",
    "border-image-source",
    "border-image-width",
    "border-left",
    "border-left-color",
    "border-left-style",
    "border-left-width",
    "border-radius",
    "border-right",
    "border-right-color",
    "border-right-style",
    "border-right-width",
    "border-spacing",
    "border-style",
    "border-top",
    "border-top-color",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-top-style",
    "border-top-width",
    "border-width",
    "bottom",
    "box-decoration-break",
    "box-shadow",
    "box-sizing",
    "break-after",
    "break-before",
    "break-inside",
    "caption-side",
    "clear",
    "clip",
    "clip-path",
    "color",
    "color-profile",
    "columns",
    "column-count",
    "column-fill",
    "column-gap",
    "column-rule",
    "column-rule-color",
    "column-rule-style",
    "column-rule-width",
    "column-span",
    "column-width",
    "content",
    "counter-increment",
    "counter-reset",
    "crop",
    "cue",
    "cue-after",
    "cue-before",
    "cursor",
    "direction",
    "display",
    "dominant-baseline",
    "drop-initial-after-adjust",
    "drop-initial-after-align",
    "drop-initial-before-adjust",
    "drop-initial-before-align",
    "drop-initial-size",
    "drop-initial-value",
    "elevation",
    "empty-cells",
    "filter",
    "fit",
    "fit-position",
    "flex",
    "flex-basis",
    "flex-direction",
    "flex-flow",
    "flex-grow",
    "flex-shrink",
    "flex-wrap",
    "float",
    "float-offset",
    "font",
    "font-family",
    "font-feature-settings",
    "font-kerning",
    "font-language-override",
    "font-size",
    "font-size-adjust",
    "font-stretch",
    "font-style",
    "font-synthesis",
    "font-variant",
    "font-variant-alternates",
    "font-variant-caps",
    "font-variant-east-asian",
    "font-variant-ligatures",
    "font-variant-numeric",
    "font-variant-position",
    "font-weight",
    "grid-cell",
    "grid-column",
    "grid-column-align",
    "grid-column-sizing",
    "grid-column-span",
    "grid-columns",
    "grid-flow",
    "grid-row",
    "grid-row-align",
    "grid-row-sizing",
    "grid-row-span",
    "grid-rows",
    "grid-template",
    "hanging-punctuation",
    "height",
    "hyphens",
    "icon",
    "image-rendering",
    "image-resolution",
    "image-orientation",
    "ime-mode",
    "inline-box-align",
    "justify-content",
    "left",
    "letter-spacing",
    "line-break",
    "line-height",
    "line-stacking",
    "line-stacking-ruby",
    "line-stacking-shift",
    "line-stacking-strategy",
    "list-style",
    "list-style-image",
    "list-style-position",
    "list-style-type",
    "margin",
    "margin-bottom",
    "margin-left",
    "margin-right",
    "margin-top",
    "marks",
    "marquee-direction",
    "marquee-loop",
    "marquee-play-count",
    "marquee-speed",
    "marquee-style",
    "mask",
    "max-height",
    "max-width",
    "min-height",
    "min-width",
    "move-to",
    "nav-down",
    "nav-index",
    "nav-left",
    "nav-right",
    "nav-up",
    "object-fit",
    "object-position",
    "opacity",
    "order",
    "orphans",
    "outline",
    "outline-color",
    "outline-offset",
    "outline-style",
    "outline-width",
    "overflow",
    "overflow-style",
    "overflow-wrap",
    "overflow-x",
    "overflow-y",
    "padding",
    "padding-bottom",
    "padding-left",
    "padding-right",
    "padding-top",
    "page",
    "page-break-after",
    "page-break-before",
    "page-break-inside",
    "page-policy",
    "pause",
    "pause-after",
    "pause-before",
    "perspective",
    "perspective-origin",
    "pitch",
    "pitch-range",
    "play-during",
    "pointer-events",
    "position",
    "presentation-level",
    "punctuation-trim",
    "quotes",
    "rendering-intent",
    "resize",
    "rest",
    "rest-after",
    "rest-before",
    "richness",
    "right",
    "rotation",
    "rotation-point",
    "ruby-align",
    "ruby-overhang",
    "ruby-position",
    "ruby-span",
    "size",
    "speak",
    "speak-as",
    "speak-header",
    "speak-numeral",
    "speak-punctuation",
    "speech-rate",
    "stress",
    "string-set",
    "table-layout",
    "tab-size",
    "target",
    "target-name",
    "target-new",
    "target-position",
    "text-align",
    "text-align-last",
    "text-decoration",
    "text-decoration-color",
    "text-decoration-line",
    "text-decoration-skip",
    "text-decoration-style",
    "text-emphasis",
    "text-emphasis-color",
    "text-emphasis-position",
    "text-emphasis-style",
    "text-height",
    "text-indent",
    "text-justify",
    "text-overflow",
    "text-outline",
    "text-rendering",
    "text-shadow",
    "text-space-collapse",
    "text-transform",
    "text-underline-position",
    "text-wrap",
    "top",
    "transform",
    "transform-origin",
    "transform-style",
    "transition",
    "transition-delay",
    "transition-duration",
    "transition-property",
    "transition-timing-function",
    "unicode-bidi",
    "vertical-align",
    "visibility",
    "voice-balance",
    "voice-duration",
    "voice-family",
    "voice-pitch",
    "voice-range",
    "voice-rate",
    "voice-stress",
    "voice-volume",
    "volume",
    "white-space",
    "widows",
    "width",
    "word-break",
    "word-spacing",
    "word-wrap",
    "z-index"
  ];
  
}});

window.require.define({"lib/custom_css": function(exports, require, module) {
  var match = require("./matches_selector");

  /**
   * Manage custom css in the document <head>
   * and maintain a rules object for easy access.
   *
   * Takes a rules argument with rules as an object.
   */
  var CustomCSS = function (rules) {
    this.sheets = {};
    this.rules = {};

    this.insertRules(rules);
  };

  /**
   * Create a stylesheet for the media type passed as argument.
   */
  CustomCSS.prototype.createSheet = function (media) {
    var node = document.createElement("style");

    node.type = "text/css";
    node.rel = "stylesheet";
    node.media = media;

    document.head.appendChild(node);

    this.sheets[media] = node.sheet;

    return this.sheets[media];
  };

  /**
   * Insert a rule in the specified media stylesheet
   * and in the rules hash.
   *
   * Create the stylesheet if it doesn't exist.
   *
   * Take a hash containing:
   * selector, property and value as required attributes
   * media and index as optional attributes
   *
   * Default media is "all".
   * Default index is taken from the stylesheet rules length
   * if it is not provided.
   */
  CustomCSS.prototype.insertRule = function (rule, overwrite) {
    var index, value
      , media = rule.media || "all";

    if (!rule.selector || !rule.property || rule.value === void 0) {
      return;
    }

    this.sheets[media] = this.sheets[media] || this.createSheet(media);

    if (rule.index !== null && rule.index !== void 0) {
      index = rule.index;
    } else if (overwrite) {
      index = this.getIndex(rule);
    }
    this.deleteRule(index);
    index = this.sheets[media].cssRules.length;

    declaration = rule.selector + " {" + rule.property + ": " + rule.value + "}";

    try {
      this.sheets[media].insertRule(declaration, index);
    } catch(e) {}

    this.rules[media] = this.rules[media] || {};
    this.rules[media][index] = {
        selector: rule.selector
      , property: rule.property
      , value: rule.value
    };

    return index;
  };

  /**
   * Insert several rules at once in stylesheets.
   *
   * Take an array of rules hashes.
   *
   * Call insertRule to actually insert individual rules.
   */
  CustomCSS.prototype.insertRules = function (css) {
    css.forEach(function (declaration, i) {
      this.insertRule(declaration);
    }, this);
  };

  /**
   * Get the index for a specific selector, property and media.
   */
  CustomCSS.prototype.getIndex = function (rule) {
    var index;

    for (index in this.rules[rule.media]) {
      if (!this.rules[rule.media].hasOwnProperty(index)) {
        continue;
      }

      if (this.rules[rule.media][index].selector === rule.selector &&
         this.rules[rule.media][index].property === rule.property) {
        return index;
      }
    }
  };

  /**
   * Get all declarations for an element, grouped per media and selector.
   */
  CustomCSS.prototype.getDeclarations = function (element) {
    var media, rule, value, index, i, l, selectorWithoutPseudo
      , allDeclarations = {}
      , mediaDeclarations = {}
      , returnValues = function (v) { return v; }
      , sortBySpecificity = function (a, b) {
        return b.specificity - a.specificity;
      };

    if (!element) {
      return;
    }

    if (!this.isElement(element)) {
      element = this.createGhostElement(element);
    }

    for (media in this.rules) {
      if (!this.rules.hasOwnProperty(media)) {
        continue;
      }

      mediaDeclarations = {};

      // Group rules by selector.
      for (index in this.rules[media]) {
        rule = this.rules[media][index];

        // Strip pseudo-elements and pseudo-classes from selector.
        selectorWithoutPseudo = rule.selector.replace(/:[^,\s]*(\w|\))/g, "").trim();

        if (selectorWithoutPseudo === "") {
          selectorWithoutPseudo = "*";
        }

        if (!match(element, selectorWithoutPseudo)) {
          continue;
        }

        if (!mediaDeclarations[rule.selector]) {
          mediaDeclarations[rule.selector] = {
              selector: rule.selector
            , rules: []
            , specificity: this.calculateSpecificity(selectorWithoutPseudo, element)
          };
        }

        l = mediaDeclarations[rule.selector].rules.length;

        mediaDeclarations[rule.selector].rules[l] = {
            property: rule.property
          , value: rule.value
          , index: index
        };
      }

      allDeclarations[media] = [];

      // Put rules in an array.
      for (i in mediaDeclarations) {
        if (!mediaDeclarations.hasOwnProperty(i)) {
          continue;
        }

        l = allDeclarations[media].length;

        allDeclarations[media][l] = mediaDeclarations[i];
      }

      // Sort rules by specificity.
      allDeclarations[media].reverse().sort(sortBySpecificity);
    }

    return allDeclarations;
  };

  /**
   * Get all rules in an array.
   */
  CustomCSS.prototype.getRules = function () {
    var media, index, selector, property, value
      , rules = [];

    for (media in this.rules) {
      if (!this.rules.hasOwnProperty(media)) {
        continue;
      }

      rules[media] = rules[media] || {};

      for (index in this.rules[media]) {
        if (!this.rules[media].hasOwnProperty(index)) {
          continue;
        }

        rule = this.rules[media][index];

        rules[rules.length] = {
            media: media
          , selector: rule.selector
          , property: rule.property
          , value: rule.value
        };
      }
    }

    return rules;
  };

  /**
   * Delete a rule from a stylesheet by its index.
   *
   * Default stylesheet is "all".
   */
  CustomCSS.prototype.deleteRule = function (index, media) {
    if (index === null || index === void 0) {
      return;
    }

    media = media || "all";

    try {
      this.sheets[media].deleteRule(index);
    } catch(e) {}

    delete this.rules[media][index];
  };

  /**
   * Calculate the specificity of a selector applied to an element.
   */
  CustomCSS.prototype.calculateSpecificity = function (selector, element) {
    var specificity;

    selector.split(",").forEach(function (selector) {
      selector = selector.trim();

      if (match(element, selector)) {
        specificity = SPECIFICITY.calculate(selector)[0].specificity;
        specificity = parseInt(specificity.split(",").join(""), 10);
        return;
      }
    });

    return specificity;
  };

  /**
   * Create a ghost element to test selector.
   */
  CustomCSS.prototype.createGhostElement = function (selector) {
    var element
      , doc = document.implementation.createHTMLDocument("")
      , selectors = selector.split(" ");

    selectors.forEach(function (selector) {
      var parent = element;

      if (selector.indexOf("#") === 0) {
        element = doc.createElement("div");
        element.id = selector.substring(1);
      } else if (selector.indexOf(".") === 0) {
        element = doc.createElement("div");
        element.classname = selector.substring(1);
      } else {
        element = doc.createElement(selector);
      }

      if (parent) {
        parent.appendChild(element);
      }
    });

    return element;
  };

  /**
   * Return true is argument is a DOM element.
   */
  CustomCSS.prototype.isElement = function (e) {
    if (typeof HTMLElement === "object") {
      return e instanceof HTMLElement;
    }
    return e && typeof e === "object" && e.nodeType === 1 &&
      typeof e.nodeName === "string";
  };

  module.exports = CustomCSS;
  
}});

window.require.define({"lib/editor_data": function(exports, require, module) {
  // Return all data for a theme.
  // Save temporarily in sessionStorage.

  var data
    , app = require("application")
    , Templates = require("collections/templates")
    , Regions = require("collections/regions")
    , Blocks = require("collections/blocks")
    , CustomCSS = require("lib/custom_css");

  data = sessionStorage.getItem("theme-" + app.data.theme._id);
  data = JSON.parse(data);

  // If no data in sessionStorage, get it from server.
  if (!data) {
    data = {
      templates: app.data.theme_pieces.templates
      , regions: app.data.theme_pieces.regions
      , blocks: app.data.theme_pieces.blocks
      , style: app.data.style
    };
  }

  data = {
    templates: new Templates(data.templates)
    , regions: new Regions(data.regions)
    , blocks: new Blocks(data.blocks)
    , style: new CustomCSS(data.style)
  };

  // Save data in sessionStorage every 1s.
  setInterval(function () {
    var store = {
      templates: data.templates.toJSON()
      , regions: data.regions.toJSON()
      , blocks: data.blocks.toJSON()
      , style: data.style.getRules()
    };

    store = JSON.stringify(store);
    try {
      sessionStorage.setItem("theme-" + app.data.theme._id, store);
    } catch(e) {
      sessionStorage.clear();
    }
  }, 1000);

  module.exports = data;
  
}});

window.require.define({"lib/html_tags": function(exports, require, module) {
  // HTML tags list.

  module.exports = [
    {
        group: "Headings"
      , tags: [
        {
            tag: "h1"
          , label: "Headings 1"
        }
        , {
            tag: "h2"
          , label: "Headings 2"
        }
        , {
            tag: "h3"
          , label: "Headings 3"
        }
        , {
            tag: "h4"
          , label: "Headings 4"
        }
        , {
            tag: "h5"
          , label: "Headings 5"
        }
        , {
            tag: "h6"
          , label: "Headings 6"
        }
      ]
    }
    , {
        group: "Content sections"
      , tags: [
        {
            tag: "p"
          , label: "Paragraphs"
        }
        , {
            tag: "blockquote"
          , label: "Block quotations"
        }
        , {
            tag: "pre"
          , label: "Pre-formatted content"
        }
        , {
            tag: "address"
          , label: "Addresses"
        }
        , {
            tag: "ins"
          , label: "Inserted content"
        }
        , {
            tag: "del"
          , label: "Deleted content"
        }
        , {
            tag: "hr"
          , label: "Horizontal rules"
        }
      ]
    }
    , {
        group: "Inline elements"
      , tags: [
        {
            tag: "a"
          , label: "Links"
        }
        , {
            tag: "abbr"
          , label: "Abbreviations"
        }
        , {
            tag: "acronym"
          , label: "Acronyms"
        }
        , {
            tag: "dfn"
          , label: "Inline definitions"
        }
        , {
            tag: "em"
          , label: "Emphases"
        }
        , {
            tag: "strong"
          , label: "Strong emphases"
        }
        , {
            tag: "cite"
          , label: "Citations"
        }
        , {
            tag: "q"
          , label: "Inline quotations"
        }
        , {
            tag: "sub"
          , label: "Subscripts"
        }
        , {
            tag: "sup"
          , label: "Superscripts"
        }
      ]
    }
    , {
        group: "Lists"
      , tags: [
        {
            tag: "dl"
          , label: "Definition Lists"
        }
        , {
            tag: "dt"
          , label: "Definition Terms"
        }
        , {
            tag: "dd"
          , label: "Definitions"
        }
        , {
            tag: "ol"
          , label: "Ordered Lists"
        }
        , {
            tag: "ul"
          , label: "Unordered Lists"
        }
        , {
            tag: "menu"
          , label: "Menu Lists"
        }
        , {
            tag: "li"
          , label: "List Items"
        }
      ]
    }
    , {
        group: "Forms"
      , tags: [
        {
            tag: "form"
          , label: "Forms"
        }
        , {
            tag: "fieldset"
          , label: "Fieldsets"
        }
        , {
            tag: "legend"
          , label: "Fieldset legends"
        }
        , {
            tag: "input[type=checkbox]"
          , label: "Checkboxes"
        }
        , {
            tag: "input[type=radio]"
          , label: "Radio buttons"
        }
        , {
            tag: "button"
          , label: "Buttons"
        }
        , {
            tag: "input[type=button]"
          , label: "Buttons"
        }
        , {
            tag: "input[type=submit]"
          , label: "Submit buttons"
        }
        , {
            tag: "input[type=image]"
          , label: "Image buttons"
        }
        , {
            tag: "input[type=reset]"
          , label: "Reset buttons"
        }
        , {
            tag: "input[type=text]"
          , label: "Text fields"
        }
        , {
            tag: "input[type=text]"
          , label: "Text fields"
        }
        , {
            tag: "input[type=password]"
          , label: "Password fields"
        }
        , {
            tag: "input[type=file]"
          , label: "File fields"
        }
        , {
            tag: "select"
          , label: "Selection lists"
        }
        , {
            tag: "optgroup"
          , label: "Group of options"
        }
        , {
            tag: "option"
          , label: "Options"
        }
        , {
            tag: "textarea"
          , label: "Multi-line text areas"
        }
      ]
    }
    , {
        group: "Tables"
      , tags: [
        {
            tag: "table"
          , label: "Tables"
        }
        , {
            tag: "caption"
          , label: "Table captions"
        }
        , {
            tag: "thead"
          , label: "Table headers"
        }
        , {
            tag: "tbody"
          , label: "Table bodies"
        }
        , {
            tag: "tfoot"
          , label: "Table footers"
        }
        , {
            tag: "tr"
          , label: "Table rows"
        }
        , {
            tag: "th"
          , label: "Table header cells"
        }
        , {
            tag: "td"
          , label: "Table data cells"
        }
        , {
            tag: "colgroup"
          , label: "Table column groups"
        }
        , {
            tag: "col"
          , label: "Table columns"
        }
      ]
    }
    , {
        group: "Media"
      , tags: [
        {
            tag: "img"
          , label: "Images"
        }
        , {
            tag: "map"
          , label: "Maps"
        }
        , {
            tag: "area"
          , label: "Map areas"
        }
        , {
            tag: "object"
          , label: "Media object"
        }
        , {
            tag: "embed"
          , label: "Media embed"
        }
        , {
            tag: "iframe"
          , label: "Iframes"
        }
      ]
    }
    , {
        group: "Computer text"
      , tags: [
        {
            tag: "code"
          , label: "Source code"
        }
        , {
            tag: "var"
          , label: "Source code variables"
        }
        , {
            tag: "kbd"
          , label: "User input"
        }
        , {
            tag: "samp"
          , label: "Program output"
        }
      ]
    }
    , {
        group: "Presentation"
      , tags: [
        {
            tag: "b"
          , label: "b"
        }
        , {
            tag: "i"
          , label: "i"
        }
        , {
            tag: "u"
          , label: "u"
        }
        , {
            tag: "s"
          , label: "s"
        }
        , {
            tag: "small"
          , label: "small"
        }
        , {
            tag: "big"
          , label: "big"
        }
        , {
            tag: "tt"
          , label: "tt"
        }
      ]
    }
  ];
  
}});

window.require.define({"lib/matches_selector": function(exports, require, module) {
  // Cross-browser way to check if a selector matches an element.

  /**
   * Element prototype.
   */

  var proto = Element.prototype;

  /**
   * Vendor function.
   */

  var vendor = proto.matchesSelector||
    proto.webkitMatchesSelector ||
    proto.mozMatchesSelector ||
    proto.msMatchesSelector ||
    proto.oMatchesSelector;

  /**
   * Expose `match()`.
   */

  module.exports = match;

  /**
   * Match `el` to `selector`.
   *
   * @param {Element} el
   * @param {String} selector
   * @return {Boolean}
   * @api public
   */

  function match(el, selector) {
    if (vendor) {
      return vendor.call(el, selector);
    }
    var nodes = el.parentNode.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; ++i) {
      if (nodes[i] == el) {
        return true;
      }
    }
    return false;
  }
  
}});

window.require.define({"lib/mixpanel": function(exports, require, module) {
  // Mixpanel tracking.
  // If debug is enabled, log data to console instead of sending to Mixpanel.
  var debug
    , app = require("application");

  debug = {
    people: {
      identify: function (user_id) {
        console.log("mixpanel.identify");
        console.log(user_id);
      }

      , increment: function (properties) {
        console.log("mixpanel.people.increment");
        console.log(properties);
      }
      , set: function (properties) {
        console.log("mixpanel.people.set");
        console.log(properties);
      }
    }

    , track: function (name, properties) {
      console.log("mixpanel.track");
      console.log(name);
      console.log(properties);
    }
  };

  module.exports = {
    initialize: function () {
      if (app.debug) {
        window.mixpanel = debug;
      }

      if (!("mixpanel" in window)) {
        return;
      }

      // Update user's attributes on login and registration.
      app.on("registration", this.setUserAttributes);
      app.on("login", this.setUserLastLogin);

      // Track click on elements with data-event attribute.
      $("body").on("click", "[data-event]", this.trackClickEvent.bind(this));

      // Track some routes.
      Backbone.history.on("route", this.trackRouteChange.bind(this));
    }

    , setUserAttributes: function (user) {
      mixpanel.people.set({
          $created: new Date(user.get("created_at"))
        , $email: user.get("email")
        , $first_name: user.get("first_name")
        , $last_name: user.get("last_name")
      });
      mixpanel.people.identify(user.id);

      mixpanel.track("Registration");
    }

    , setUserLastLogin: function (user) {
      mixpanel.people.set({$last_login: new Date()});
      mixpanel.people.identify(user.id);

      mixpanel.track("Login");
    }

    // data-event attribute should be in the format
    // "eventName:[propertyKey:propertyValue]*"
    , trackClickEvent: function (e) {
      var double
        , properties = {}
        , details = e.currentTarget.getAttribute("data-event").split(":")
        , name = details.splice(0, 1)[0]
        , methodName = "trackUser" + name.replace(/\s/g,"");

      while (details.length > 0) {
        double = details.splice(0, 2);
        properties[double[0]] = double[1];
      }

      mixpanel.track(name, properties);

      // Update user's attributes in relevant cases as well.
      if (this[methodName] !== void 0) {
        this[methodName](properties);
      }
    }

    , trackUserDownload: function (properties) {
      mixpanel.people.increment(properties.format + " downloads");
    }

    , trackUserNewTheme: function (properties) {
      mixpanel.people.increment("themes " + properties.type);
    }

    , trackRouteChange: function (router, name) {
      switch (name) {
        case "index":
          mixpanel.track("Home Page Visit");
          break;

        case "register":
          mixpanel.track("Registration Form Loaded");
          break;
      }
    }
  };
  
}});

window.require.define({"lib/mutations": function(exports, require, module) {
  // Copy changes from the template build.

  var app = require("application");

  module.exports = {
    initialize: function () {
      app.on("node:added", this.addNode.bind(this));
      app.on("node:removed", this.removeNode.bind(this));

      this.pieces = {};
      app.trigger("mutations:started", this.pieces);
    }

    , addNode: function (node, type) {
      var topNode, region, template, parentNode, sandbox, block, sibling, templateClone;

      copy = node.cloneNode(true);

      if (type === "row") {
        topNode = node.parentNode;
      } else {
        topNode = node.parentNode.parentNode;

        // Add corresponding Liquid tag in column node.
        for (var i in this.pieces.blocks.models) {
          block = this.pieces.blocks.models[i];

          if (node.firstElementChild.getAttribute("data-x-name") === block.get("name") &&
              node.firstElementChild.getAttribute("data-x-label") === block.get("label")) {
            copy.innerHTML = block.tag();
            break;
          }
        }
      }

      piece = this.getTemplatePiece(topNode);

      sandbox = (new DOMParser()).parseFromString(piece.get("template"), "text/html");

      // Get parent destination.
      parentNode = sandbox.getElementById(node.parentNode.id);

      this.cleanupNode(copy);

      // Insert the node in the template.
      // If the next sibling of the node is the footer region,
      // insert the node at the end.
      if (node.nextElementSibling) {
        if ("FOOTER" === node.nextElementSibling.tagName) {
          sandbox.body.innerHTML = sandbox.body.innerHTML + copy.outerHTML;
        } else {
          nextNode = sandbox.getElementById(node.nextElementSibling.id);
          if (nextNode.parentNode) {
            nextNode.parentNode.insertBefore(copy, nextNode);
          }
        }
      } else {
        sandbox.getElementById(node.parentNode.id).appendChild(copy);
      }

      piece.set("template", sandbox.body.innerHTML);
    }

    , removeNode: function (node, oldParentNode, type) {
      var topNode;

      if (type === "row") {
        topNode = oldParentNode;
      } else {
        topNode = oldParentNode.parentNode;

        // If no topNode, it means the parent row has been removed as well.
        if (topNode === null) {
          return;
        }
      }

      piece = this.getTemplatePiece(topNode);

      sandbox = (new DOMParser()).parseFromString(piece.get("template"), "text/html");

      copy = sandbox.getElementById(node.id);

      copy.parentNode.removeChild(copy);

      piece.set("template", sandbox.body.innerHTML);
    }

    , getTemplatePiece: function(topNode) {
      var piece, template, regions, regionName;

      template = this.pieces.templates.getCurrent();

      if (["HEADER", "FOOTER"].indexOf(topNode.tagName) !== -1) {
        regionName = topNode.tagName.toLowerCase();
        regions = template.get("regions");
        piece = this.pieces.regions.getByName(regionName, regions[regionName]);

        piece.set("build", topNode.outerHTML);
      } else {
        piece = template;

        templateClone = window.document.getElementById("page").cloneNode(true);
        $(templateClone).children("header, footer").remove();
        piece.set("build", templateClone.innerHTML);
      }

      return piece;
    }

    , cleanupNode: function(node) {
      $(node)
        .removeClass("x-current x-full x-not-full x-empty")
        .children(".x-resize, .x-remove")
          .remove()
          .end()
        .find("a[data-bypass=true]")
          .removeAttr("data-bypass");
    }
  };
  
}});

window.require.define({"lib/view_helpers": function(exports, require, module) {
  var app = require("application")
    , User = require("models/user");

  Handlebars.registerHelper("current_user", function () {
    return !!app.currentUser.id;
  });

  Handlebars.registerHelper("selected", function (value, current) {
    return value === current ? " selected='selected'" : "";
  });
  
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
      idAttribute: "_id"

    , defaults: {
        name: ""
      , template: ""
      , build: ""
    }

    , label: function () {
      return _.str.titleize(this.get("label") + " " + _.str.humanize(this.get("name")));
    }

    , className: function () {
      return this.get("name").replace("_", "-");
    }

    // Return block Liquid tag
    , tag: function () {
      var label = "";

      if (this.get("label") !== "Default") {
        label = " " + this.get("label");
      }

      return "{% " + this.get("name") + label + " %}";
    }
  });
  
}});

window.require.define({"models/region": function(exports, require, module) {
  // Region model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
      idAttribute: "_id"

    , defaults: {
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
      idAttribute: "_id"

    , defaults: {
        name: ""
      , template: ""
      , build: ""
      , regions: { header: "default", footer: "default" }
    }

    , label: function () {
      var key;

      for (key in this.standards) {
        if (!this.standards.hasOwnProperty(key)) {
          continue;
        }

        if (this.get("name") === this.standards[key].name) {
          return this.standards[key].label;
        }
      }

      return this.get("name");
    }

    , setRegion: function (name, slug) {
      var regions = this.get("regions");
      regions[name] = slug;
      this.set("regions", regions);
    }

    // Standard WordPress templates.
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

    , canEdit: function (theme) {
      return this.id === theme.get("author_id");
    }
  });
  
}});

window.require.define({"router": function(exports, require, module) {
  var app = require("application");

  module.exports = Backbone.Router.extend({
    routes: {
        "": "user_themes"
      , "themes": "themes"
      , "themes/:id": "theme"
      , "themes/:id/edit": "edit"
      , "account": "account"
      , "login": "login"
      , "register": "register"
      , "reset_password": "reset_password"
      , "*actions": "notFound"
    }

    , themes: function () {
      this.userOnly();
      this.view = app.createView("themes");
      this.render();
    }

    , user_themes: function () {
      this.userOnly();
      this.view = app.createView("user_themes");
      this.render();
    }

    , theme: function (id) {
      this.view = app.createView("theme", {themeID: id});
      this.render();

      jQuery(function ($) {
        $("body").on("click", ".accordion-toggle", function (e) {
          $(".color").spectrum({
              showAlpha: true
            , showInput: true
            , showPalette: true
            , preferredFormat: "rgb"
            , change: function(color, i) {
              $("#theme").get(0).contentWindow.$(this).trigger("change");
            }
          });
        });
      });
    }

    , edit: function (id) {
      if (app.currentTheme === void 0) {
        $("#main", window.top.document).empty()
          .append(app.createView("not_found").render().$el);
        return;
      }

      $("#menubar", window.top.document).empty()
        .append(app.createView("menubar").render().$el);

      if (app.currentUser.canEdit(app.currentTheme)) {
        app.createView("editor").render();
      }
    }

    , account: function () {
      this.userOnly();
      this.view = app.createView("account");
      this.render();
    }

    , login: function () {
      this.anonymousOnly();
      this.view = app.createView("login");
      this.render();
    }

    , register: function () {
      this.anonymousOnly();
      this.view = app.createView("register");
      this.render();
    }

    , reset_password: function () {
      this.anonymousOnly();
      this.view = app.createView("password_reset");
      this.render();
    }

    , notFound: function (action) {
      this.view = app.createView("not_found");
      this.render();
    }

    , userOnly: function () {
      if (!app.currentUser.id) {
        document.location = "/login";
        return true;
      }
    }

    , anonymousOnly: function () {
      if (app.currentUser.id) {
        document.location = "/";
        return true;
      }
    }

    , render: function () {
      if (this._currentView) {
        this._currentView.teardown();
      }

      this._currentView = this.view;

      $("#main").empty().append(this.view.render().$el);
    }
  });
  
}});

window.require.define({"views/account": function(exports, require, module) {
  // User account edit and delete.

  var app = require("application"),
      View = require("views/base/view"),
      template = require("views/templates/account"),
      User = require("models/user");

  module.exports = View.extend({
    className: "row",
    template: "account",
    model: _.clone(app.currentUser),
    validateModel: true,

    events: {
      "submit form": "editUser",
      "change .error input": "clearError",
      "click #delete-user": "deleteUser"
    },

    render: function () {
      this.$el.empty().append(template(this.model.toJSON()));

      return this;
    },

    editUser: function (e) {
      var attrs = {};

      e.preventDefault();

      this.$("input").each(function () {
        attrs[this.getAttribute("name")] = this.value;
      });

      this.$("button[type=submit]").get(0).setAttribute("disabled", "true");

      this.model.save(attrs, {
        success: function (model, res) {
          app.currentUser.set(res);

          this.$("button[type=submit]").get(0).removeAttribute("disabled");

          app.trigger("user:edit", app.currentUser);
          app.trigger("notification", "success", "Changes to your account have been saved.");
        }.bind(this)

        , error: function (model, err) {
          this.$("button[type=submit]").get(0).removeAttribute("disabled");

          this.displayServerErrors(err);
        }.bind(this)
      });
    },

    displayServerErrors: function (err) {
      if (! err.responseText) {
        return;
      }

      var msgs = JSON.parse(err.responseText);

      Object.keys(msgs).forEach(function (attr) {
        var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " " + msgs[attr][0];
        Backbone.Validation.callbacks.invalid(this, attr, msg, "name");
      }.bind(this));
    },

    clearError: function (e) {
      $(e.currentTarget).closest(".error")
        .removeClass("error")
        .find(".error-message").remove();
    },

    deleteUser: function () {
      var message = "Are you sure you want to delete your account? " +
        "All your data will be deleted and we won't be able to recover it.";

      if (!window.confirm(message)) {
        return;
      }

      this.model.destroy({
        success: function (model) {
          window.location = "/";
        },

        error: function (model) {
          app.trigger("notification", "error", "Error. Unable to delete your " +
                      "account. Please try again or contact us.");
        }
      });
    }
  });

  
}});

window.require.define({"views/advanced_style_edit": function(exports, require, module) {
  // CSS style edit.

  var View = require("views/base/view")
    , declaration_template = require("views/templates/declaration")
    , rule_template = require("views/templates/rule")
    , app = require("application")
    , html_tags = require("lib/html_tags");

  module.exports = View.extend({
    events: {
        "click .add-rule": "addRuleInputs"
      , "keyup .rules input": "editRule"
      , "change .rules input": "editRule"

      , "click .add-declaration": "addDeclarationInputs"
      , "keyup .selector input": "editDeclaration"
      , "change .selector input": "editDeclaration"
    }

    , render: function () {
      var html = ""
        , declarations = this.options.currentCSS
        , i;

      if (declarations) {
        for (i = 0; i < declarations.length; i++) {
          html += declaration_template(declarations[i]);
        }
      }

      html += "<button class='btn add-declaration'>Add declaration</button>";

      this.$el.empty().append(html);

      // Overline low specificity rules.
      this.markNonAppliedRules();

      return this;
    }

    , addRuleInputs: function (e) {
      var $button = $(e.currentTarget)
        , $ul = $button.siblings("ul");

      e.preventDefault();

      $ul.append(rule_template({
        selector: $button.siblings(".selector").find("input").val()
      }));
    }

    , editRule: function (e, element) {
      var selector, index
        , $li = $(e.target).parent();

      property = $li.find("input[name=property]").val();
      value = $li.find("input[name=value]").val();
      index = $li.find("input[name=index]").val() || null;
      selector = $li.find("input[name=selector]").val();

      // Trim whitespace and comma from selector to avoid DOM exception 12
      selector = selector.trim().replace(/^[^a-zA-Z#\.\[]|\W+$/g, "");

      if (property && value) {
        index = this.options.customCSS.insertRule({
            selector: selector
          , property: property
          , value: value
          , index: index
          , media: this.options.media
        });
      } else {
        if (index) {
          this.options.customCSS.deleteRule(index, this.options.media);
          index = "";
        }

        if (!property && !value && e.type === "change") {
          $li.remove();
        }
      }

      $li.find("input[name=index]").val(index);
    }

    , addDeclarationInputs: function (e) {
      var selector = this.options.selector;

      e.preventDefault();

      if (this.options.tag) {
        selector = this.options.selector + " " + this.options.tag;
      }

      $(e.currentTarget).before(declaration_template({selector: selector}));
    }

    , editDeclaration: function (e) {
      var $input = $(e.currentTarget)
        , value = $input.val();

      if (!value && e.type === "change") {
        $input.closest(".declaration-inputs").remove();
      }

      $input
        .parent()
          .siblings("ul")
            .find("input[name=selector]")
              .val(value)
              .trigger("change");
    }

    , markNonAppliedRules: function () {
      var applied = {};
      this.$(".rules input[name=property]").each(function () {
        var similar = applied[this.value];

        if (similar === void 0) {
          applied[this.value] = this;
          return;
        }

        if (this.parentNode.parentNode !== similar.parentNode.parentNode) {
          $(this.parentNode).addClass("inactive");
        }
      });
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

    , objectEvents: {
      model: {
        "change": "render"
      }
    }

    , render: function () {
      var links = template(this.model.toJSON());

      this.$el.empty().append(links);

      return this;
    }

    // Send request to delete current user session
    // and redirect to homepage on success
    , deleteSession: function (e) {
      e.preventDefault();

      $.ajax({
          contentType: "application/json; charset=UTF-8"
        , dataType: "json"
        , type: "DELETE"
        , url: "/session"
        , complete: function (jqXHR, textStatus) {
          if (textStatus === "success") {
            sessionStorage.clear();

            app.trigger("logout");

            setTimeout(function () {
              window.location = "/login";
            });
          }
        }.bind(this)
      });
    }
  });
  
}});

window.require.define({"views/base/view": function(exports, require, module) {
  var app = require("application");

  require("lib/view_helpers");

  module.exports = Backbone.View.extend({
    // Call on for each model, collection and app event, instantiate the
    // subViews array and bind validation events.
    initialize: function (options) {
      this.subViews = [];

      for (var object in this.objectEvents) {
        if (!this.objectEvents.hasOwnProperty(object)) {
          return;
        }

        this._listenTo(object, this.objectEvents[object]);
      }

      if (this.validateModel) {
        Backbone.Validation.bind(this);
      }

      this._listenTo(app, this.appEvents);
    },

    // Teardown all the subviews, unbind validation events,
    // remove the view element and undelegate its events.
    teardown: function () {
      this.subViews.forEach(function (subView) {
        subView.teardown();
      });

      if (this.validateModel) {
        Backbone.Validation.unbind(this);
      }

      this.remove();
      this.undelegateEvents();

      return this;
    },

    render: function () {
      var data;

      if (this.template) {
        data = _.isFunction(this.data) ? this.data() : this.data;

        this.$el.empty().append(require("views/templates/" + this.template)(data));
      }

      return this;
    },

    _listenTo: function (object, events) {
      if (object !== Object(object)) {
        object = this[object];
      }

      for (var event in events) {
        var callback = events[event];

        this.listenTo(object, event, this[callback]);
      }
    }
  });
  
}});

window.require.define({"views/blocks": function(exports, require, module) {
  // Display list of blocks to insert
  var View = require("views/base/view")
    , template = require("views/templates/blocks")
    , app = require("application");

  module.exports = View.extend({
      id: "x-block-insert"
    , className: "x-section"
    , collection: app.editor.blocks

    , events: {
        "click .new-block": "showForm"
      , "submit .new-block-select": "addBlock"
      , "click .close": "removeBlock"
      , "mouseover .x-drag": "makeDraggable"
    }

    , objectEvents: {
      collection: {
        "reset": "addAll",
        "add": "addOne",
        "remove": "removeOne"
      }
    }

    , appEvents: {
      "mutations:started": "makeMutable",
      "save:before": "addThemeAttributes",
      "block:inserted": "insertBlock"
    }

    , allBlocks: function () {
      return _.map(app.data.blocks, function (block) {
        block.label = _.str.titleize(_.str.humanize(block.name));
        return block;
      });
    }

    , render: function () {
      this.$el.empty().append(template({all: this.allBlocks}));

      this.collection.reset(this.collection.models);

      return this;
    }

    , makeDraggable: function (e) {
      this.$(e.currentTarget).draggable({
          addClasses: false
        , helper: function() {
          // Append a clone to the body to avoid overflow on parent accordion.
          return $(this).clone().appendTo("body");
        }
        , revert: "invalid"
        , scroll: false
        , zIndex: 99999
      });
    }

    , addOne: function (block) {
      var remove = "";

      if (block.get("label") != "Default") {
        remove = " <span class='close' title='Delete block'>&times;</span>";
      }

      this.$("ul").append("<li class='x-drag' data-cid='" + block.cid + "'>" +
                          "<span>&Dagger;</span> " + block.label() + remove + "</li>");
    }

    , addAll: function () {
      this.$("ul").empty();

      _.each(this.collection.models, function (block) {
        this.addOne(block);
      }, this);
    }

    , removeOne: function (block) {
      this.$("span[data-cid='" + block.cid + "']").closest("li").remove();
    }

    // If the element is inserted in a row,
    // load the actual template chuck to insert
    , insertBlock: function (element, id) {
      var block = this.collection.get($(element).data("cid"));

      element.outerHTML = "<div id='" + id + "' class='column " +
        block.className() + "'>" + block.get("build") + "</div>";

      app.trigger("node:added", window.document.getElementById(id));
    }

    , makeMutable: function (pieces) {
      pieces.blocks = this.collection;
    }

    , showForm: function (e) {
      var $div = this.$(".new-block-select");

      if ($div.is(":hidden")) {
        $div.show("normal");
      } else {
        $div.hide("normal");
      }
    }

    , addBlock: function (e) {
      var name, label, attributes, block, build;

      e.preventDefault();

      name = this.$(".new-block-select select").val();
      label = this.$(".new-block-name").val();

      if (!label) {
        app.trigger("notification", "error", "Please, enter a block name.");
        return;
      }

      attributes = _.clone(_.find(this.allBlocks, function (block) {
        return block.name === name;
      }));

      build = (new DOMParser()).parseFromString(attributes.build, "text/html").body;
      build.firstChild.setAttribute("data-x-label", label);
      build.firstChild.setAttribute("data-x-name", name);

      attributes.build = build.outerHTML;
      attributes.label = label;

      this.collection.add(attributes);
      this.render();

      app.trigger("notification", "success", "New block created. Drag and drop into the page to add it.");
    }

    , removeBlock: function (e) {
      if (confirm("Are you sure you want to delete this block?")) {
        var cid = $(e.currentTarget).parent().data("cid");
        this.collection.remove(cid);
        this.render();
      }
    }

    , addThemeAttributes: function (attributes) {
      attributes.blocks = _.map(this.collection.models, function (block) {
        return _.pick(block.attributes, "_id", "name", "label", "template");
      });
    }
  });
  
}});

window.require.define({"views/copy": function(exports, require, module) {
  var app = require("application"),
      View = require("views/base/view"),
      copy = require("views/templates/copy");

  module.exports = View.extend({
    tagName: "li",
    className: "dropdown",
    model: app.currentTheme,

    events: {
      "click #copy-theme": "copyTheme"
    }

    , render: function () {
      this.$el.empty()
        .append(copy({theme_id: this.model.id}));

      return this;
    }

    , copyTheme: function (e) {
      var element = e.currentTarget;

      e.preventDefault();

      // Set timeout so that button is disabled after all script are run
      // to avoid blocking event bubbling
      setTimeout(function () {
        element.setAttribute("disabled", "true");
        element.innerHTML = "Started the Photocopier";
      }, 0);

      $.ajax({
        type: "POST",
        url: "/themes/fork",
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify({id: this.model.id}),
        success: function (data) {
          var theme = JSON.parse(data);

          window.top.Application.trigger("theme:copied", theme);

          app.trigger("notification", "success", "The theme has been copied. " +
                      "Now start editing.");

          window.top.Backbone.history.navigate("/themes/" + theme._id, true);
        },
        error: function () {
          element.removeAttribute("disabled");
          element.innerHTML = "Copy Theme";

          app.trigger("notification", "error", "Error. Unable to copy theme. " +
                      "Please reload the page and try again.");
        }
      });
    }
  });
  
}});

window.require.define({"views/device_switch": function(exports, require, module) {
  var app = require("application")
    , View = require("views/base/view")
    , device_switch = require("views/templates/device_switch");

  module.exports = View.extend({
    tagName: "li",
    className: "dropdown-submenu",
    id: "device-switch"

    , events: {
        "click .pc-size": "resizeToPC"
      , "click .tablet-size": "resizeToTablet"
      , "click .phone-size": "resizeToPhone"
      , "click .dropdown-menu a": "highlightActive"
    }

    , render: function () {
      this.el.innerHTML = device_switch();

      return this;
    }

    , highlightActive: function (e) {
      this.$(".active").removeClass("active");
      $(e.currentTarget.parentNode).addClass("active");
    }

    , resizeToPC: function (e) {
      e.preventDefault();

      $("#theme", window.top.document).animate({
          width: "1440px"
        , left: "50%"
        , "margin-left": "-50%"
      });
    }

    , resizeToTablet: function (e) {
      e.preventDefault();

      $("#theme", window.top.document).animate({
          width: "768px"
        , left: "50%"
        , "margin-left": "-384px"
      });
    }

    , resizeToPhone: function (e) {
      e.preventDefault();

      $("#theme", window.top.document).animate({
          width: "480px"
        , left: "50%"
        , "margin-left": "-240px"
      });
    }
  });

  
}});

window.require.define({"views/download": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application")
    , download = require("views/templates/download");

  module.exports = View.extend({
    tagName: "li",
    className: "dropdown",
    model: app.currentTheme,

    events: {
      "click a": "askForPatience"
    },

    appEvents: {
      "save:after": "waitForArchive"
    },

    render: function () {
      this.$el.empty().append(download({id: this.model.id}));

      return this;
    },

    waitForArchive: function (theme) {
      var eventSource = new EventSource("/jobs/" + theme.get("archive_job_id"));

      this.waitingForArchive = true;

      eventSource.addEventListener("success", this.archiveSuccess.bind(this), false);
      eventSource.addEventListener("errors", this.archiveErrors.bind(this), false);
    },

    askForPatience: function (e) {
      if (this.waitingForArchive) {
        e.preventDefault();

        app.trigger("notification", "info", "The theme archives are being " +
                    "regenerated. Please try again in a moment.");
      }
    },

    archiveSuccess: function (e) {
      this.waitingForArchive = false;

      app.trigger("notification", "success", "Theme archives updated.");
    },

    archiveErrors: function (e) {
      this.waitingForArchive = false;

      app.trigger("notification", "error", "Error updating the theme archives.");
    }
  });
  
}});

window.require.define({"views/edit_actions": function(exports, require, module) {
  var app = require("application")
    , View = require("views/base/view")
    , mutations = require("lib/mutations")
    , accordion_group = require("views/templates/accordion_group");

  module.exports = View.extend({
    id: "edit-actions"

    , panels: [
        {
          id: "templates"
        , title: "Current Template"
        , view: "templatesView"
      }
      , {
          id: "regions"
        , title: "Header &amp; Footer"
        , view: "regionsView"
      }
      , {
          id: "blocks"
        , title: "Blocks"
        , view: "blocksView"
      }
      , {
          id: "share_link"
        , title: "Share"
        , view: "shareLinkView"
      }
    ]

    , render: function () {
      this.templatesView = app.createView("templates");
      this.regionsView = app.createView("regions");
      this.blocksView = app.createView("blocks");
      this.styleEditView = app.createView("style_edit");
      this.shareLinkView = app.createView("share_link");
      this.layoutView = app.createView("layout");

      this.subViews.push(this.templatesView, this.regionsViews, this.blocksView,
                         this.styleEditview, this.shareLinkView, this.layoutView);

      // Setup drag and drop and resize
      this.layoutView.render();

      this.$el.empty()
        .append("<div id='general'></div>")
        .children()
          .append("<div class='accordion'>" + this.accordionGroups.apply(this) + "</div>")
          .end()
        .append(this.styleEditView.render().$el.hide());

      for (var i in this.panels) {
        if (!this.panels.hasOwnProperty(i)) {
          return;
        }

        this.$("#editor-" + this.panels[i].id + " .accordion-inner")
          .empty()
          .append(this[this.panels[i].view].render().$el);
      }

      mutations.initialize();

      return this;
    }

    , accordionGroups: function () {
      var groups = "";

      for (var i in this.panels) {
        if (this.panels.hasOwnProperty(i)) {
          groups += this.buildAccordionGroup(this.panels[i]);
        }
      }

      return groups;
    }

    , buildAccordionGroup: function (attributes) {
      return accordion_group({
          parent: "editor-accordion"
        , id: "editor-" + attributes.id
        , title: attributes.title
        , content: ""
      });
    }
  });
  
}});

window.require.define({"views/editor": function(exports, require, module) {
  var app = require("application")
    , View = require("views/base/view")
    , data = require("lib/editor_data")
    , mutations = require("lib/mutations")
    , theme_meta = require("views/templates/theme_meta")
    , accordion_group = require("views/templates/accordion_group");

  module.exports = View.extend({
    id: "layout-editor"

    , initialize: function () {
      _.extend(app.editor, {
          preview_only: !!app.data.preview_only
        , templates: data.templates
        , regions: data.regions
        , blocks: data.blocks
        , style: data.style
      });

      $(window).on("resize", this.resize.bind(this));

      View.prototype.initialize.call(this);
    }

    , teardown: function () {
      $(window).off("resize", this.resize.bind(this));

      View.prototype.teardown.call(this);
    }

    // Show editor when "template:loaded" event is triggered
    , render: function () {
      var editorToggleView = app.createView("editor_toggle"),
          themeMetaView = app.createView("theme_meta"),
          actionsView = app.createView("edit_actions");

      this.subViews.push(editorToggleView, themeMetaView, actionsView);

      this.$el.empty()
        .append(editorToggleView.render().$el)
        .append(themeMetaView.render().$el)
        .append(actionsView.render().$el);

      this.$el.appendTo($("#main", window.top.document));

      this.resize();
      this.preventActions();

      app.trigger("editor:loaded");

      return this;
    }

    , resize: function () {
      this.$el.height($(window.top).height() - 40);

      $("#canvas", window.top.document).width($(window.top).width() - 250);
    }

    // Prevent click, drag and submit on links, images and forms
    // respectively in the iframe
    , preventActions: function () {
      $("body").on("click", ".column a", this.preventDefault)
        .on("mousedown", ".column a, .column img", this.preventDefault)
        .on("submit", ".column form", this.preventDefault);
    }

    , preventDefault: function (e) {
      e.preventDefault();
    }
  });
  
}});

window.require.define({"views/editor_toggle": function(exports, require, module) {
  var app = require("application")
    , View = require("views/base/view");

  module.exports = View.extend({
    id: "editor-toggle"

    , events: {
      "click": "toggleEditor"
    }

    , render: function () {
      this.el.innerHTML = "&rarr;";

      return this;
    }

    , toggleEditor: function (e) {
      if (this.el.className === "collapsed") {
        $(e.currentTarget.parentNode).animate({"margin-right": "0"});
        $("#canvas", window.top.document).animate({
          width: this.canvasWidth
        });
        this.el.innerHTML = "&rarr;";
        this.el.className = "";
      } else {
        this.canvasWidth = $("#canvas", window.top.document).css("width");

        $(e.currentTarget.parentNode).animate({"margin-right": "-250px"});
        $("#canvas", window.top.document).animate({width: "100%"});

        this.el.innerHTML = "&larr;";
        this.el.className = "collapsed";
      }
    }
  });
  
}});

window.require.define({"views/layout": function(exports, require, module) {
  var totalColumnsWidth, isRowFull
    , View = require("views/base/view")
    , app = require("application")
    , idIncrement = 1;

  // Return total width of all columns children of a row
  // except the one being dragged
  totalColumnsWidth = function (dropElement, dragElement) {
    return _.reduce($(dropElement).children(), function (memo, child) {
      if (child === dragElement) {
        return memo;
      } else {
        return memo + $(child).outerWidth(true);
      }
    }, 0);

  };

  // Does total width of all columns children of a drop row
  // allow a new column?
  isRowFull = function (dropElement, dragElement) {
    return $(dropElement).children().length > 0 &&
      $(dropElement).width() < totalColumnsWidth(dropElement, dragElement) + $(dragElement).width();
  };

  module.exports = View.extend({
      el: $("body")

    , events: {
        // Highlight columns.
        "click .column": "highlightColumns"

        // Remove column
      , "click .column .x-remove": "removeColumn"

      , "mouseenter .column": "makeDraggable"

      , "mouseenter .row": "makeDroppable"

      , "mouseenter .x-resize": "makeResizeable"
    }

    , appEvents: {
      "region:loaded": "highLightEmpty",
      "template:loaded": "highLightEmpty"
    }

    , initialize: function () {
      this.$el.addClass("editing");
      this.makeDroppable();

      View.prototype.initialize.call(this);
    }

    , highLightEmpty: function () {
      this.$(".row").each(function (i, row) {
        var $row = $(row);

        if ($row.children().length === 0) {
          $row.addClass("x-empty");
        }
      });
    }

    , makeDraggable: function (e) {
      this.$(".column").draggable({
          addClasses: false
        , revert: "invalid"
        , drag: this.dragOn
        , start: this.dragStart
        , stop: this.dragStop
        , zIndex: 99999
      });
    }

    , makeDroppable: function (e) {
      this.$(".row").droppable({
          accept: ".column, .x-drag"
        , addClasses: false
        , drop: this.dropOn.bind(this)
        , out: this.dropOut
        , over: this.dropOver
      });
    }

    , makeResizeable: function (e) {
      $(e.currentTarget).draggable({
          addClasses: false
        , axis: "x"
        , containment: this.$el.children()
        , drag: this.resizeOn
        , stop: this.resizeStop
      });
    }

    // Remove .x-current from previously highlighted column and add to current one.
    // Add resize and delete handles to the column if they weren't there already.
    , highlightColumns: function (e) {
      var $column, name, slug;

      app.trigger("column:highlight", e.currentTarget);

      $column = $(e.currentTarget);

      this.$(".x-current").removeClass("x-current");
      $column.addClass("x-current");

      if ($column.children(".x-resize").length === 0) {
        $column.html(function (i, html) {
          return html + "<div class='x-resize' title='Resize element'>&rang;</div>";
        });
      }

      if ($column.children(".x-remove").length === 0) {
        $column.html(function (i, html) {
          return html + "<div class='x-remove' title='Remove element'>&times;</div>";
        });
      }

      if ($column.children(".x-name").length === 0) {
        name = $column.children(":first").data("x-name");
        label = $column.children(":first").data("x-label");

        if (!name || !label) {
          return;
        }

        label = _.str.titleize(label + " " + _.str.humanize(name));

        $column.html(function (i, html) {
          return html + "<div class='x-name'>" + label + "</div>";
        });
      }
    }

    , dragStart: function (e, ui) {
      if ($.browser.msie || $.browser.mozilla) {
        $(this).data("start-scroll", $("html").scrollTop());
      } else {
        $(this).data("start-scroll", $("body").scrollTop());
      }
      app.trigger("node:removed", ui.helper[0], ui.helper[0].parentNode);
    }

    , dragOn: function(e, ui) {
      var sc = parseInt($(this).data("start-scroll"), 10);
      if ($.browser.msie || $.browser.mozilla) {
        ui.position.top -= $("html").scrollTop() - sc;
      } else {
        ui.position.top -= $("body").scrollTop() - sc;
      }
    }

    // Reset position of dragged element.
    , dragStop: function (e, ui) {
      ui.helper.removeAttr("style");

      app.trigger("node:added", ui.helper[0]);
    }

    // Mark the row as full or not.
    , dropOver: function (e, ui) {
      $(this).addClass(function () {
        if (isRowFull(this, ui.draggable.get(0))) {
          $(this).addClass("x-full");
        } else {
          $(this).addClass("x-not-full");
        }
      });
    }

    // Remove x-full or x-not-full class if previously added.
    , dropOut: function (e, ui) {
      $(this).removeClass("x-full x-not-full");
    }

    // Add column to row. If the row is full, add a new row.
    // If original parent row doesn't have any more children
    // and is not a <header> or <footer> and has no id attribute, remove it.
    // Remove x-full and x-not-full classes if one was previously added.
    , dropOn: function (e, ui) {
      var row, $drag, $dragParent, $dragGrandParent;

      $drag = ui.helper;
      $drop = $(e.target);

      $dragParent = $drag.parent();

      if (isRowFull(e.target, ui.helper.get(0))) {
        $row = $("<div class='row' id='y-" + idIncrement + "'></div>").insertAfter($drop);
        idIncrement++;
        app.trigger("node:added", $row[0], "row");
      } else {
        $row = $drop;
      }
      $drag.appendTo($row);

      $drop.removeClass("x-empty x-full x-not-full");

      if ($drag.data("cid")) {
        app.trigger("block:inserted", $drag[0], "y-" + idIncrement);
        idIncrement++;
      } else if ($dragParent.children().length === 0) {
        this.maybeRemoveRow($dragParent.get(0));
      }
    }

    // Resize the column.
    // Sum of column widths in the row should never be larger than row.
    , resizeOn: function (e, ui) {
      var $column = ui.helper.parent()
      , $row = $column.parent();

      width = ui.position.left + 12;

      if (width >= $row.width()) {
        width = $row.width();
      } else if (width >= $row.width() - totalColumnsWidth($row.get(0), $column.get(0))) {
        width = $row.width() - totalColumnsWidth($row.get(0), $column.get(0));
        // When width is a float, calculation is incorrect because browsers use integers
        // The following line fixes that. Replace as soon as you find a cleaner solution
        width = width - 1;
      }

      $column.attr("style", "width: " + width + "px");
    }

    // Reset position of resize handle
    , resizeStop: function (e, ui) {
      var $drag = ui.helper
        , $column = $drag.parent();

      app.trigger("resize:end", "#page #" + $column[0].id, $column[0].style.width);

      $drag.removeAttr("style");
      $column.removeAttr("style");
    }

    // Remove column if confirmed.
    // Remove the whole row if it would be empty.
    , removeColumn: function (e) {
      var nodeToRemove, type, parentNodeId
        , grandParentNode = e.currentTarget.parentNode.parentNode;

      if (!confirm("Are you sure you want to remove this element?")) {
        return;
      }

      nodeToRemove = e.currentTarget.parentNode;
      parentNodeId = nodeToRemove.parentNode.id;

      nodeToRemove.parentNode.removeChild(nodeToRemove);

      app.trigger("node:removed", nodeToRemove,
                  window.document.getElementById(parentNodeId), "column");

      if (grandParentNode.children.length === 0) {
        this.maybeRemoveRow(grandParentNode);
      }
    }

    // Check if a row is the last one in the header or footer
    // or has a custom ID before removing it.
    , maybeRemoveRow: function (node) {
      var parent = node.parentNode
        , parentId = parent.id;

      if ((["HEADER", "FOOTER"].indexOf(parent.tagName) !== -1 &&
           parent.children.length === 1) ||
          (node.id.indexOf("x-") !== 0 && node.id.indexOf("y-") !== 0)) {
        node.className += " x-empty";
      } else {
        parent.removeChild(node);

        app.trigger("node:removed", node,
                    window.document.getElementById(parentId), "row");
      }
    }
  });
  
}});

window.require.define({"views/login": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application")
    , Themes = require("collections/themes");

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
      var data = {},
          button = this.$("button[type=submit]").get(0);

      button.setAttribute("disabled", "true");

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
              this.model.set("themes", new Themes(response.themes));

              app.trigger("login", this.model);
              app.trigger("notification", "success", "Welcome back, " + this.model.get("first_name") + ".");
            break;

            case "error":
              var form = this.$("form");

              if (form.children(".alert-error").length === 0) {
                form.prepend("<p class='alert alert-error'>" + response.error + "</p>");
              }

              button.removeAttribute("disabled");
            break;
          }
        }.bind(this)
      });
    }
  });
  
}});

window.require.define({"views/menubar": function(exports, require, module) {
  var app = require("application"),
      View = require("views/base/view"),
      menubar = require("views/templates/menubar");

  module.exports = View.extend({
    tagName: "ul",
    className: "nav",
    model: app.currentTheme,

    render: function () {
      this.$el.empty().append(menubar({theme_name: this.model.get("name")}));

      this.buildFileMenu();
      this.buildViewMenu();

      return this;
    },

    buildFileMenu: function () {
      var menu = this.$("#file-menu"),
          copyView = app.createView("copy"),
          saveView = app.createView("save"),
          downloadView = app.createView("download");

      this.subViews.push(copyView);

      if (app.currentUser.canEdit(app.currentTheme)) {
        menu.append(saveView.render().$el);
        menu.append(downloadView.render().$el);
      }

      menu.append(copyView.render().$el);
    },

    buildViewMenu: function () {
      var menu = this.$("#view-menu"),
          deviceSwitchView = app.createView("device_switch"),
          templatesSelectView = app.createView("templates_select");

      this.subViews.push(deviceSwitchView, templatesSelectView);

      menu.append(deviceSwitchView.render().$el);

      if (!app.currentUser.canEdit(app.currentTheme)) {
        menu.append(templatesSelectView.render().$el);
      }
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

    , appEvents: {
      "notification": "showNotification"
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
        this.$("button[type=submit]").get(0).setAttribute("disabled", "true");

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
              app.trigger("notification", "success", "We have sent you an email with a link to confirm your new password.");
            break;

            case "error":
              this.$("button[type=submit]").get(0).removeAttribute("disabled");
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
    , collection: app.editor.regions

    , events: {
        "change .x-header-select, .x-footer-select": "switchRegion"
      , "click .x-header-new button, .x-footer-new button": "addRegion"
    }

    , objectEvents: {
      collection: {
        "add": "addOne"
      }
    }

    , appEvents: {
      "save:before": "addThemeAttributes",
      "mutations:started": "makeMutable",
      "template:load": "addRegionsToTemplate"
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
      var name = region.get("name");

      app.trigger("region:load", region);

      $("#page").children(name)[0].outerHTML = region.get("build");
      $("#page").children(name).fadeOut().fadeIn();

      app.trigger("region:loaded", region);
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

    , addThemeAttributes: function (attributes) {
      attributes.regions = _.map(this.collection.models, function (region) {
        return _.pick(region.attributes, "_id", "name", "slug", "template");
      });
    }

    , makeMutable: function (pieces) {
      pieces.regions = this.collection;
    }

    // Add corresponding regions attributes to template so that the regions are
    // displayed in the template.
    // Mark the regions as selected in the editor.
    , addRegionsToTemplate: function (template) {
      var regions = template.get("regions");

      template.set("regions_attributes", {
          header: this.collection.getByName("header", regions.header)
        , footer: this.collection.getByName("footer", regions.footer)
      });

      this.$(".x-header-select").val(regions.header);
      this.$(".x-footer-select").val(regions.footer);
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
    , validateModel: true

    , events: {
      "submit form": "createUser",
      "change .error input": "clearError"
    }

    // Create current user from form input values and submit to the server.
    // Handle error messages from server.
    , createUser: function (e) {
      e.preventDefault();

      var user = this.model
        , attrs = {};

      this.$("input").each(function () {
        attrs[this.getAttribute("name")] = this.value;
      });

      this.$("button[type=submit]").get(0).setAttribute("disabled", "true");

      user.save(attrs, {
        success: function (model, res) {
          model.set(res);

          app.trigger("registration", model);
          app.trigger("notification", "success", "Your registration was successful. You are now logged in.");
        }.bind(this)

        , error: function (model, err) {
          this.$("button[type=submit]").get(0).removeAttribute("disabled");

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
    },

    clearError: function (e) {
      $(e.currentTarget).closest(".error")
        .removeClass("error")
        .find(".error-message").remove();
    }
  });
  
}});

window.require.define({"views/save": function(exports, require, module) {
  var View = require("views/base/view"),
      app = require("application"),
      save = require("views/templates/save");

  module.exports = View.extend({
    tagName: "li",
    className: "dropdown",

    events: {
      "click #save-theme": "saveTheme"
    },

    render: function () {
      this.$el.empty().append(save());

      return this;
    },

    saveTheme: function (e) {
      var attrs = _.clone(app.data.theme);

      app.trigger("save:before", attrs);

      app.currentUser.get("themes").create(attrs, {
        success: function (theme) {
          app.trigger("save:after", theme);

          app.trigger("notification", "success", "Theme saved.");
        }
        , error: function (theme, response) {
          app.trigger("save:error");

          app.trigger("notification", "error", "Unable to save the theme. Please try again.");
        }
      });
    }
  });
  
}});

window.require.define({"views/share_link": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      id: "share-link"
    , className: "x-section well well-small"
    , template: "share_link"
    , data: {
      theme: app.currentTheme.id
    }
  });
  
}});

window.require.define({"views/simple_style_edit": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application")
    , template = require("views/templates/simple_style_edit");

  module.exports = View.extend({
    events: {
        "change input, select": "editStyle"
      , "keyup input[type=text]": "editStyle"
    }

    , render: function () {
      var currentCSS = this.options.currentCSS || {};

      switch (currentCSS.textAlign) {
        case "start" :
          currentCSS.textAlign = "left";
          break;

        case "end" :
          currentCSS.textAlign = "right";
          break;
      }

      this.el.innerHTML = template(currentCSS);

      return this;
    }

    , editStyle: function (e) {
      var field = e.currentTarget
        , selector = this.options.selector
        , property = field.name
        , value;

      if (this.options.tag) {
        selector += " " + this.options.tag;
      }

      switch (field.nodeName) {
        case "INPUT":
          value = field.value;
          break;

        case "SELECT":
          value = field.options[field.selectedIndex].value;
          break;
      }

      if ((property === "font-size" || property.match(/^(margin|padding)/)) &&
          !isNaN(parseFloat(value)) && isFinite(value)) {
        value = value + "px";
      }

      this.options.customCSS.insertRule({
        selector: selector
        , property: property
        , value: value
        , media: this.options.media
      }, true);
    }
  });
  
}});

window.require.define({"views/style_edit": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/style_edit")
    , declaration_template = require("views/templates/declaration")
    , rule_template = require("views/templates/rule")
    , app = require("application")
    , html_tags = require("lib/html_tags");

  module.exports = View.extend({
      id: "style-edit"
    , className: "x-section"

    , events: {
        "click .selector-choice a": "highlightElement"
      , "change .tag": "setTag"

      , "click .back-to-general": "hideEditor"
      , "change input[name=style_advanced]": "switchEditor"
    }

    , appEvents: {
      "column:highlight": "showEditor",
      "save:before": "addThemeAttributes",
      "resize:end": "changeWidth"
    }

    , initialize: function () {
      this.selector = "body";
      this.customCSS = app.editor.style;
      this.editorView = "simple_style_edit";

      View.prototype.initialize.call(this);
    }

    , setTag: function (e) {
      this.tag = $(e.target).val();

      this.render();
    }

    , setColumn: function (element) {
      this.selector = "#" + element.id;
      this.render();
    }

    , render: function () {
      var advanced = this.editorView === "advanced_style_edit" ? true : false,
          editorView;

      this.media = "all";

      this.el.innerHTML = template({
          htmlTags: this.tagOptions()
        , selector: this.selector
        , parents: $(this.selector).parents().get().reverse()
        , advanced: advanced
      });

      editorView = app.createView(this.editorView, {
          selector: this.selector
        , tag: this.tag
        , media: this.media
        , customCSS: this.customCSS
        , currentCSS: this.currentElementStyle(!advanced)
      });
      this.subViews.push(editorView);

      this.$el.append(editorView.render().$el);

      return this;
    }

    , tagOptions: function () {
      var _this = this;

      return html_tags.map(function (group) {
        group.tags = group.tags.map(function (tag) {
          tag.selectedAttr = tag.tag === _this.tag ? " selected" : "";
          return tag;
        });
        return group;
      });
    }

    , addThemeAttributes: function (attributes) {
      attributes.style = this.customCSS.getRules();
    }

    , changeWidth: function (selector, width) {
      width = parseInt(width, 10) / $(selector).parent().width() * 100;
      width = (Math.round(width * 100) / 100) + "%";

      this.customCSS.insertRule({
          selector: selector
        , property: "width"
        , value: width
        , media: "all"
      }, true);

      this.render();
    }

    , highlightElement: function (e) {
      var selector = e.currentTarget.getAttribute("data-selector");

      e.preventDefault();

      $(".x-current").removeClass("x-current");
      $(selector).addClass("x-current");

      this.selector = selector;
      this.render();
    }

    , showEditor: function (element) {
      this.setColumn(element);
      this.$el.siblings("#general").hide();
      this.$el.show();
    }

    , hideEditor: function () {
      this.$el.hide();
      this.$el.siblings("#general").show();
    }

    , switchEditor: function (e) {
      if (e.currentTarget.checked) {
        this.editorView = "advanced_style_edit";
      } else {
        this.editorView = "simple_style_edit";
      }

      this.render();
    }

    , currentElementStyle: function (computed) {
      var style, declarations, $element, $fakeElement;

      if (this.tag) {
        $element = $("<" + this.tag + ">");
        $fakeElement = $("<div></div>");
        $fakeElement
          .hide()
          .append($element)
          .appendTo($(this.selector));
      } else {
        $element = $(this.selector);
      }

      if (computed) {
        style = _.clone(window.getComputedStyle($element.get(0)));
      } else {
        declarations = this.customCSS.getDeclarations($element.get(0));
        if (declarations) {
          style = declarations[this.media];
        }
      }

      if ($fakeElement) {
        $fakeElement.remove();
      }

      return style;
    }
  });
  
}});

window.require.define({"views/templates": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application")
    , Template = require("models/template")
    , template = require("views/templates/templates");

  module.exports = View.extend({
      id: "templates-select"
    , className: "x-section"
    , collection: app.editor.templates

    , events: {
        "change ul input": "switchTemplate"
      , "focus ul input": "switchTemplate"
      , "blur ul input": "switchTemplate"
      , "click .close": "removeTemplate"
      , "click .new-template": "showForm"
      , "change .new-template-select select": "selectTemplate"
      , "submit .new-template-select": "addTemplate"
    }

    , objectEvents: {
      collection: {
        "add": "addOne",
        "reset": "addAll",
        "remove": "removeOne"
      }
    }

    , appEvents: {
      "save:before": "addThemeAttributes",
      "mutations:started": "makeMutable",
      "region:load": "saveRegion"
    }

    , render: function () {
      var standards = _.reject((new Template()).standards, function (standard) {
        return !!this.collection.getByName(standard.name);
      }.bind(this));

      this.$el.empty().append(template({
          standards: standards
        , edit: !app.editor.preview_only
      }));

      this.collection.reset(this.collection.models);

      this.loadTemplate(this.collection.getCurrent());

      return this;
    }

    , addOne: function (template) {
      var checked = ""
        , current = ""
        , remove = "";

      if (template.cid === this.collection.getCurrent().cid) {
        checked = " checked='checked'";
        current = " class='current'";
      }

      if (template.get("name") != "index") {
        remove = "<span class='close' title='Delete template'>&times;</span>";
      }

      this.$("ul").append("<li" + current + "><label><input name='x-template'" + checked +
                          " type='radio' value='" + template.cid + "' />" +
                          template.label() + "</label>" + remove + "</li>");
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
      var template = this.collection.get(this.$("ul input:checked").val());

      this.$("ul li").removeClass("current");
      this.$("ul input:checked").closest("li").addClass("current");

      this.loadTemplate(template);
    }

    // Save current template, display it and trigger template:loaded event
    , loadTemplate: function (template) {
      var regions;

      app.trigger("template:load", template);

      regions = template.get("regions_attributes");

      build = regions.header.get("build") + template.get("build") + regions.footer.get("build");

      $("#page").fadeOut().empty().append(build).fadeIn();

      this.collection.setCurrent(template);

      app.trigger("template:loaded", template);
    }

    // Remove column if confirmed.
    , removeTemplate: function (e) {
      if (confirm("Are you sure you want to delete this template?")) {
        var cid = $(e.currentTarget).parent().find("input").val();
        this.collection.remove(cid);
        this.render();
      }
    }

    , showForm: function (e) {
      var $div = this.$(".new-template-select");

      if ($div.is(":hidden")) {
        $div.show("normal");
      } else {
        $div.hide("normal");
      }
    }

    , selectTemplate: function (e) {
      if ($(e.currentTarget).val() === "") {
        this.$(".new-template-name").show().css("display", "block");
      } else {
        this.$(".new-template-name").hide();
      }
    }

    , addTemplate: function (e) {
      var name, attributes, template;

      e.preventDefault();

      name = this.$(".new-template-select select").val() ||
             this.$(".new-template-name").val();

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

    , addThemeAttributes: function (attributes) {
      attributes.templates = _.map(this.collection.models, function (template) {
        return _.pick(template.attributes, "_id", "name", "template");
      });
    }

    , makeMutable: function (pieces) {
      pieces.templates = this.collection;
    }

    , saveRegion: function (region) {
      this.collection.getCurrent().setRegion(region.get("name"), region.get("slug"));
    }
  });
  
}});

window.require.define({"views/templates/accordion_group": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<div class=\"accordion-group\">\n  <div class=\"accordion-heading\">\n    <h4 class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#";
    foundHelper = helpers.parent;
    stack1 = foundHelper || depth0.parent;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "parent", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" data-target=\"#";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n      ";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n    </h4>\n  </div>\n  <div id=\"";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" class=\"accordion-body collapse\">\n    <div class=\"accordion-inner\">\n      ";
    foundHelper = helpers.content;
    stack1 = foundHelper || depth0.content;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "content", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n    </div>\n  </div>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/account": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<h1 class=\"page-header\">Account / Profile</h1>\n<form class=\"form-horizontal span6\">\n  <fieldset>\n    <legend>Name and Email</legend>\n\n    <div class=\"control-group\">\n      <label class=\"control-label\" for=\"new-first-name\">First Name</label>\n      <div class=\"controls\">\n        <input type=\"text\" class=\"input-xlarge\" name=\"first_name\" value=\"";
    foundHelper = helpers.first_name;
    stack1 = foundHelper || depth0.first_name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "first_name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n      </div>\n    </div>\n\n    <div class=\"control-group\">\n      <label class=\"control-label\" for=\"new-last-name\">Last Name</label>\n      <div class=\"controls\">\n        <input type=\"text\" class=\"input-xlarge\" name=\"last_name\" value=\"";
    foundHelper = helpers.last_name;
    stack1 = foundHelper || depth0.last_name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "last_name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n      </div>\n    </div>\n\n    <div class=\"control-group\">\n      <label class=\"control-label\" for=\"new-email\">Email Address</label>\n      <div class=\"controls\">\n        <input type=\"text\" class=\"input-xlarge\" name=\"email\" value=\"";
    foundHelper = helpers.email;
    stack1 = foundHelper || depth0.email;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "email", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n      </div>\n    </div>\n\n    <div class=\"control-group\">\n      <label class=\"control-label\" for=\"new-password\">Current Password</label>\n      <div class=\"controls\">\n        <input type=\"password\" class=\"input-xlarge\" name=\"current_password\">\n      </div>\n    </div>\n  </fieldset>\n\n  <fieldset>\n    <legend>Change Password <small>(leave the fields below blank if not changing)</small></legend>\n    <div class=\"control-group\">\n      <label class=\"control-label\" for=\"new-password\">New Password</label>\n      <div class=\"controls\">\n        <input type=\"password\" class=\"input-xlarge\" name=\"password\">\n      </div>\n    </div>\n\n    <div class=\"control-group\">\n      <label class=\"control-label\" for=\"new-password-confirmation\">Password Confirmation</label>\n      <div class=\"controls\">\n        <input type=\"password\" class=\"input-xlarge\" name=\"password_confirmation\">\n      </div>\n    </div>\n  </fieldset>\n\n  <div class=\"control-group\">\n    <div class=\"controls\">\n      <button type=\"submit\" class=\"btn btn-primary submit\">Save Changes</button>\n    </div>\n  </div>\n</form>\n\n<div class=\"span6\">\n  <button id=\"delete-user\" class=\"btn btn-danger pull-right\">Delete Account</button>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/auth_links": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  <ul class=\"nav pull-right\">\n    <li class=\"dropdown\">\n      <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n        <i class=\"icon-user\"></i> ";
    foundHelper = helpers.first_name;
    stack1 = foundHelper || depth0.first_name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "first_name", { hash: {} }); }
    buffer += escapeExpression(stack1) + " ";
    foundHelper = helpers.last_name;
    stack1 = foundHelper || depth0.last_name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "last_name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\n        <b class=\"caret\"></b>\n      </a>\n      <ul class=\"dropdown-menu\">\n        <li><a href=\"/account\" id=\"account\"><i class=\"icon-wrench\"></i> Settings</a></li>\n        <li><a href=\"//support.makeatheme.com\" target=\"_blank\" id=\"support\"><i class=\"icon-question-sign\"></i> Help & Feedback</a></li>\n        <li><a href=\"#\" id=\"logout\"><i class=\"icon-signout\"></i> Log out</a></li>\n      </ul>\n    </li>\n  </ul>\n";
    return buffer;}

  function program3(depth0,data) {
    
    
    return "\n  <ul class=\"nav pull-right\">\n    <li><a id=\"register\" href=\"/register\">Register</a></li>\n    <li><a id=\"login\" href=\"/login\">Log in</a></li>\n  </ul>\n";}

    foundHelper = helpers.current_user;
    stack1 = foundHelper || depth0.current_user;
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

window.require.define({"views/templates/blocks": function(exports, require, module) {
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

    buffer += "<p>Drag and drop to insert</p>\n<ul class=\"rects\"></ul>\n<form class=\"new-block-select hide\">\n  <legend>Add New Block</legend>\n    <select>\n      ";
    foundHelper = helpers.all;
    stack1 = foundHelper || depth0.all;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </select>\n  </label>\n  <input class=\"new-block-name\" type=\"text\" value=\"\" placeholder=\"Enter block name\" />\n  <button class=\"new-block-add btn\">Add block</button>\n</form>\n<button class=\"new-block\">&plus; New Block</button>\n";
    return buffer;});
}});

window.require.define({"views/templates/copy": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this;

  function program1(depth0,data) {
    
    
    return "\n  <a href=\"#\" data-bypass=\"true\" id=\"copy-theme\"\n    data-event=\"New Theme:type:copy\"><i class=\"icon-copy\"></i> Copy Theme</a>\n";}

  function program3(depth0,data) {
    
    
    return "\n  <a href=\"/login\"><i class=\"icon-file\"></i> Login to Copy Theme</a>\n";}

    foundHelper = helpers.current_user;
    stack1 = foundHelper || depth0.current_user;
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

window.require.define({"views/templates/declaration": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data,depth1) {
    
    var buffer = "", stack1;
    buffer += "\n    <li>\n      <input name=\"property\" value=\"";
    foundHelper = helpers.property;
    stack1 = foundHelper || depth0.property;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "property", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" placeholder=\"property\" />:\n      <input name=\"value\" value=\"";
    foundHelper = helpers.value;
    stack1 = foundHelper || depth0.value;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "value", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" placeholder=\"value\" />\n      <input type=\"hidden\" name=\"index\" value=\"";
    foundHelper = helpers.index;
    stack1 = foundHelper || depth0.index;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "index", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n      <input type=\"hidden\" name=\"selector\" value=\"";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth1.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n    </li>\n    ";
    return buffer;}

    buffer += "<form class=\"declaration-inputs\">\n  <p class=\"selector\">\n    <input value=\"";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth0.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" placeholder=\"selector\" />&nbsp; {\n  </p>\n  <ul class=\"rules\">\n    ";
    foundHelper = helpers.rules;
    stack1 = foundHelper || depth0.rules;
    stack2 = helpers.each;
    tmp1 = self.programWithDepth(program1, data, depth0);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </ul>\n  <button class=\"btn btn-mini add-rule\">Add rule</button>\n  <p>}</p>\n</form>\n";
    return buffer;});
}});

window.require.define({"views/templates/device_switch": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<a tabindex=\"-1\" href=\"#\">Switch Device</a>\n<ul class=\"dropdown-menu\">\n  <li class=\"active\"><a href=\"#\" data-bypass=\"true\" class=\"pc-size\"><i class=\"f-icon-monitor\"></i> PC</a></li>\n  <li><a href=\"#\" data-bypass=\"true\" class=\"tablet-size\"><i class=\"f-icon-tablet\"></i> Tablet</a></li>\n  <li><a href=\"#\" data-bypass=\"true\" class=\"phone-size\"><i class=\"f-icon-mobile\"></i> Phone</a></li>\n</ul>\n";});
}});

window.require.define({"views/templates/download": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<a href=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/download\" data-event=\"Download:format:HTML\"\n  target=\"_blank\" data-bypass=\"true\"><i class=\"c-icon-html5\"></i> Download HTML5</a>\n<a href=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/download/wordpress\" data-event=\"Download:format:WordPress\"\n  target=\"_blank\" data-bypass=\"true\"><i class=\"c-icon-wordpress\"></i> Download WordPress</a>\n";
    return buffer;});
}});

window.require.define({"views/templates/login": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <h3>Please authenticate yourself</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"email\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" name=\"password\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Log In</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Forgot your password? <a href=\"/reset_password\" data-dismiss=\"modal\">Reset password</a></li>\n    <li>Don't have an account yet? <a href=\"/register\" data-dismiss=\"modal\">Register</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/menubar": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<ul class=\"nav\">\n  <li class=\"divider-vertical\"></li>\n  <li class=\"navbar-text\">";
    foundHelper = helpers.theme_name;
    stack1 = foundHelper || depth0.theme_name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "theme_name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</li>\n  <li class=\"divider-vertical\"></li>\n  <li class=\"dropdown\">\n    <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">File <b class=\"caret\"></b></a>\n    <ul class=\"dropdown-menu\" id=\"file-menu\"></ul>\n  </li>\n  <li class=\"dropdown\">\n    <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">View <b class=\"caret\"></b></a>\n    <ul class=\"dropdown-menu\" id=\"view-menu\"></ul>\n  </li>\n</ul>\n";
    return buffer;});
}});

window.require.define({"views/templates/not_found": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<h1 class=\"page-header\">Ooops! We screwed up. :(</h1>\n<p class=\"lead\">Sorry, the page you were looking for doesn’t exist.</p>\n<p>Go back to <a href=\"/\" title=\"www.makeatheme.com\">homepage</a> or\n<a href='http://support.makeatheme.com'>contact us</a> about a problem.</p>\n";});
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


    return "<div class=\"modal-header\">\n  <h3>Reset password</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\" id=\"password_reset\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"email\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"password\">New Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" name=\"password\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Send reset email</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Remember your password? <a href=\"/login\" data-dismiss=\"modal\">Log in</a></li>\n    <li>Don't have an account yet? <a href=\"/register\" data-dismiss=\"modal\">Register</a></li>\n  </ul>\n</div>\n";});
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

    buffer += "<label for=\"template-header\">Header:</label>\n<select class=\"x-header-select\" id=\"template-header\">\n  ";
    foundHelper = helpers.headers;
    stack1 = foundHelper || depth0.headers;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <option value=\"\">new header</option>\n</select>\n<div class=\"x-header-new\">\n  <input type=\"text\" value=\"\" placeholder=\"Enter header name\" />\n  <button class=\"x-header-add btn\">Add header</button>\n</div>\n\n<label for=\"template-footer\">Footer:</label>\n<select class=\"x-footer-select\" id=\"template-footer\">\n  ";
    foundHelper = helpers.footers;
    stack1 = foundHelper || depth0.footers;
    stack2 = helpers.each;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <option value=\"\">new footer</option>\n</select>\n<div class=\"x-footer-new\">\n  <input type=\"text\" value=\"\" placeholder=\"Enter footer name\" />\n  <button class=\"x-footer-add btn\">Add footer</button>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/register": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <h3>Create a free account</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-first-name\">First Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"first_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-last-name\">Last Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"last_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"email\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" class=\"input-xlarge\" name=\"password\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password-confirmation\">Password Confirmation</label>\n        <div class=\"controls\">\n          <input type=\"password\" class=\"input-xlarge\" name=\"password_confirmation\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary submit\">Register</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Already have an account? <a href=\"/login\" data-dismiss=\"modal\">Log in</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/rule": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<li>\n  <input name=\"property\" value=\"\" placeholder=\"property\" />:\n  <input name=\"value\" value=\"\" placeholder=\"value\" />\n  <input type=\"hidden\" name=\"selector\" value=\"";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth0.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n  <input type=\"hidden\" name=\"index\" />\n</li>\n";
    return buffer;});
}});

window.require.define({"views/templates/save": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<a href=\"#\" data-bypass=\"true\" id=\"save-theme\"><i class=\"icon-save\"></i> Save Theme</a>\n";});
}});

window.require.define({"views/templates/share_link": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<p>http://makeatheme.com/themes/";
    foundHelper = helpers.theme;
    stack1 = foundHelper || depth0.theme;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "theme", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</p>\n";
    return buffer;});
}});

window.require.define({"views/templates/simple_style_edit": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, stack3, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<div class=\"accordion\" id=\"visual-style\">\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <h4 class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#visual-style\" data-target=\"#style-typography\">\n        Typography\n      </h4>\n    </div>\n    <div id=\"style-typography\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n\n        <div class=\"controls-group\">\n          <label for=\"visual-font-family\">Font family</label>\n          <div class=\"controls\">\n            <select id=\"visual-font-family\" name=\"font-family\" class=\"input-medium\">\n              <option";
    stack1 = "Arial, Helvetica, sans-serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='Arial, Helvetica, sans-serif'>Arial</option>\n              <option";
    stack1 = "'Arial Black', Gadget, sans-serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='\"Arial Black\", Gadget, sans-serif'>Arial Black</option>\n              <option";
    stack1 = "'Comic Sans MS', cursive, sans-serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='\"Comic Sans MS\", cursive, sans-serif'>Comic Sans MS</option>\n              <option";
    stack1 = "'Courier New', Courier, monospace";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='\"Courier New\", Courier, monospace'>Courier New</option>\n              <option";
    stack1 = "Georgia, serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='Georgia, serif'>Georgia</option>\n              <option";
    stack1 = "'Helvetica Neue', Helvetica, Arial, sans-serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='\"Helvetica Neue\", Helvetica, Arial, sans-serif'>Helvetica Neue</option>\n              <option";
    stack1 = "Impact, Charcoal, sans-serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='Impact, Charcoal, sans-serif'>Impact</option>\n              <option";
    stack1 = "'Lucida Console', Monaco, monospace";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='\"Lucida Console\", Monaco, monospace'>Lucida Console</option>\n              <option";
    stack1 = "'Lucida Sans Unicode', 'Lucida Grande', sans-serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='\"Lucida Sans Unicode\", \"Lucida Grande\", sans-serif'>Lucida Sans Unicode</option>\n              <option";
    stack1 = "'Palatino Linotype', 'Book Antiqua', Palatino, serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='\"Palatino Linotype\", \"Book Antiqua\", Palatino, serif'>Palatino Linotype</option>\n              <option";
    stack1 = "Verdana, Geneva, sans-serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='Verdana, Geneva, sans-serif'>Verdana</option>\n              <option";
    stack1 = "Tahoma, Geneva, sans-serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='Tahoma, Geneva, sans-serif'>Tahoma</option>\n              <option";
    stack1 = "'Times New Roman', Times, serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='\"Times New Roman\", Times, serif'>Times New Roman</option>\n              <option";
    stack1 = "'Trebuchet MS', Helvetica, sans-serif";
    foundHelper = helpers.fontFamily;
    stack2 = foundHelper || depth0.fontFamily;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + "\n                value='\"Trebuchet MS\", Helvetica, sans-serif'>Trebuchet MS</option>\n            </select>\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-font-size\">Font size</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-font-size\" name=\"font-size\" class=\"input-mini\" value=\"";
    foundHelper = helpers.fontSize;
    stack1 = foundHelper || depth0.fontSize;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "fontSize", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-font-weight\">Font weight</label>\n          <div class=\"controls\">\n            <select id=\"visual-font-weight\" name=\"font-weight\" class=\"input-medium\">\n              <option";
    stack1 = "normal";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"normal\">normal</option>\n              <option";
    stack1 = "bold";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"bold\">bold</option>\n              <option";
    stack1 = "100";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"100\">100</option>\n              <option";
    stack1 = "200";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"200\">200</option>\n              <option";
    stack1 = "300";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"300\">300</option>\n              <option";
    stack1 = "400";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"400\">400</option>\n              <option";
    stack1 = "500";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"500\">500</option>\n              <option";
    stack1 = "600";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"600\">600</option>\n              <option";
    stack1 = "700";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"700\">700</option>\n              <option";
    stack1 = "800";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"800\">800</option>\n              <option";
    stack1 = "900";
    foundHelper = helpers.fontWeight;
    stack2 = foundHelper || depth0.fontWeight;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"900\">900</option>\n            </select>\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-font-style\">Font style</label>\n          <div class=\"controls\">\n            <select id=\"visual-font-style\" name=\"font-style\" class=\"input-medium\">\n              <option";
    stack1 = "normal";
    foundHelper = helpers.fontStyle;
    stack2 = foundHelper || depth0.fontStyle;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"normal\">normal</option>\n              <option";
    stack1 = "italic";
    foundHelper = helpers.fontStyle;
    stack2 = foundHelper || depth0.fontStyle;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"italic\">italic</option>\n              <option";
    stack1 = "oblique";
    foundHelper = helpers.fontStyle;
    stack2 = foundHelper || depth0.fontStyle;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"oblique\">oblique</option>\n            </select>\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-line-height\">Line height</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-line-height\" name=\"line-height\" class=\"input-mini\" value=\"";
    foundHelper = helpers.lineHeight;
    stack1 = foundHelper || depth0.lineHeight;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "lineHeight", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-text-align\">Text align</label>\n          <div class=\"controls\">\n            <select id=\"visual-text-align\" name=\"text-align\" class=\"input-medium\">\n              <option";
    stack1 = "left";
    foundHelper = helpers.textAlign;
    stack2 = foundHelper || depth0.textAlign;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"left\">left</option>\n              <option";
    stack1 = "right";
    foundHelper = helpers.textAlign;
    stack2 = foundHelper || depth0.textAlign;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"right\">right</option>\n              <option";
    stack1 = "center";
    foundHelper = helpers.textAlign;
    stack2 = foundHelper || depth0.textAlign;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"center\">center</option>\n              <option";
    stack1 = "justify";
    foundHelper = helpers.textAlign;
    stack2 = foundHelper || depth0.textAlign;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"justify\">justify</option>\n            </select>\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-text-decoration\">Text decoration</label>\n          <div class=\"controls\">\n            <select id=\"visual-text-decoration\" name=\"text-decoration\" class=\"input-medium\">\n              <option";
    stack1 = "none";
    foundHelper = helpers.textDecoration;
    stack2 = foundHelper || depth0.textDecoration;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"none\">none</option>\n              <option";
    stack1 = "line-through";
    foundHelper = helpers.textDecoration;
    stack2 = foundHelper || depth0.textDecoration;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"line-through\">line-through</option>\n              <option";
    stack1 = "overline";
    foundHelper = helpers.textDecoration;
    stack2 = foundHelper || depth0.textDecoration;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"overline\">overline</option>\n              <option";
    stack1 = "underline";
    foundHelper = helpers.textDecoration;
    stack2 = foundHelper || depth0.textDecoration;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"underline\">underline</option>\n            </select>\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-text-transform\">Text transform</label>\n          <div class=\"controls\">\n            <select id=\"visual-text-transform\" name=\"text-transform\" class=\"input-medium\">\n              <option";
    stack1 = "none";
    foundHelper = helpers.textTransform;
    stack2 = foundHelper || depth0.textTransform;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"none\">none</option>\n              <option";
    stack1 = "capitalize";
    foundHelper = helpers.textTransform;
    stack2 = foundHelper || depth0.textTransform;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"capitalize\">capitalize</option>\n              <option";
    stack1 = "lowercase";
    foundHelper = helpers.textTransform;
    stack2 = foundHelper || depth0.textTransform;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"lowercase\">lowercase</option>\n              <option";
    stack1 = "uppercase";
    foundHelper = helpers.textTransform;
    stack2 = foundHelper || depth0.textTransform;
    foundHelper = helpers.selected;
    stack3 = foundHelper || depth0.selected;
    if(typeof stack3 === functionType) { stack1 = stack3.call(depth0, stack2, stack1, { hash: {} }); }
    else if(stack3=== undef) { stack1 = helperMissing.call(depth0, "selected", stack2, stack1, { hash: {} }); }
    else { stack1 = stack3; }
    buffer += escapeExpression(stack1) + " value=\"uppercase\">uppercase</option>\n            </select>\n          </div>\n        </div>\n\n      </div>\n    </div>\n  </div>\n\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <h4 class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#visual-style\" data-target=\"#style-color\">\n        Color & Background\n      </h4>\n    </div>\n    <div id=\"style-color\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n\n        <div class=\"controls-group\">\n          <label for=\"visual-color\">Color</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-color\" class=\"input-medium color\"\n              name=\"color\" value=\"";
    foundHelper = helpers.color;
    stack1 = foundHelper || depth0.color;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "color", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-background-color\">Background color</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-background-color\" class=\"input-medium color\"\n              name=\"background-color\" value=\"";
    foundHelper = helpers.backgroundColor;
    stack1 = foundHelper || depth0.backgroundColor;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "backgroundColor", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n      </div>\n    </div>\n  </div>\n\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <h4 class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#visual-style\" data-target=\"#style-margins\">\n        Margins\n      </h4>\n    </div>\n    <div id=\"style-margins\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n\n        <div class=\"controls-group\">\n          <label for=\"visual-margin-top\">Top Margin</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-margin-top\" class=\"input-mini\"\n              name=\"margin-top\" value=\"";
    foundHelper = helpers.marginTop;
    stack1 = foundHelper || depth0.marginTop;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "marginTop", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-margin-right\">Right Margin</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-margin-right\" class=\"input-mini\"\n              name=\"margin-right\" value=\"";
    foundHelper = helpers.marginRight;
    stack1 = foundHelper || depth0.marginRight;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "marginRight", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-margin-bottom\">Bottom Margin</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-margin-bottom\" class=\"input-mini\"\n              name=\"margin-bottom\" value=\"";
    foundHelper = helpers.marginBottom;
    stack1 = foundHelper || depth0.marginBottom;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "marginBottom", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-margin-left\">Left Margin</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-margin-left\" class=\"input-mini\"\n              name=\"margin-left\" value=\"";
    foundHelper = helpers.marginLeft;
    stack1 = foundHelper || depth0.marginLeft;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "marginLeft", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n      </div>\n    </div>\n  </div>\n\n  <div class=\"accordion-group\">\n    <div class=\"accordion-heading\">\n      <h4 class=\"accordion-toggle\" data-toggle=\"collapse\"\n        data-parent=\"#visual-style\" data-target=\"#style-padding\">\n        Padding\n      </h4>\n    </div>\n    <div id=\"style-padding\" class=\"accordion-body collapse\">\n      <div class=\"accordion-inner\">\n\n        <div class=\"controls-group\">\n          <label for=\"visual-padding-top\">Top Padding</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-padding-top\" class=\"input-mini\"\n              name=\"padding-top\" value=\"";
    foundHelper = helpers.paddingTop;
    stack1 = foundHelper || depth0.paddingTop;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "paddingTop", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-padding-right\">Right Padding</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-padding-right\" class=\"input-mini\"\n              name=\"padding-right\" value=\"";
    foundHelper = helpers.paddingRight;
    stack1 = foundHelper || depth0.paddingRight;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "paddingRight", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-padding-bottom\">Bottom Padding</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-padding-bottom\" class=\"input-mini\"\n              name=\"padding-bottom\" value=\"";
    foundHelper = helpers.paddingBottom;
    stack1 = foundHelper || depth0.paddingBottom;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "paddingBottom", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n        <div class=\"controls-group\">\n          <label for=\"visual-padding-left\">Left Padding</label>\n          <div class=\"controls\">\n            <input type=\"text\" id=\"visual-padding-left\" class=\"input-mini\"\n              name=\"padding-left\" value=\"";
    foundHelper = helpers.paddingLeft;
    stack1 = foundHelper || depth0.paddingLeft;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "paddingLeft", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n          </div>\n        </div>\n\n      </div>\n    </div>\n  </div>\n\n</div>\n\n";
    return buffer;});
}});

window.require.define({"views/templates/style_edit": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    
    return " checked=\"checked\"";}

  function program3(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n";
    foundHelper = helpers.parents;
    stack1 = foundHelper || depth0.parents;
    stack2 = helpers.each;
    tmp1 = self.program(4, program4, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n";
    return buffer;}
  function program4(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    stack2 = helpers['if'];
    tmp1 = self.program(5, program5, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(7, program7, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n";
    return buffer;}
  function program5(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n<a href=\"#\" data-selector=\"#";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" data-bypass=\"true\">#";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a> &gt;\n";
    return buffer;}

  function program7(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n<a href=\"#\" data-selector=\"";
    foundHelper = helpers.localName;
    stack1 = foundHelper || depth0.localName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "localName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" data-bypass=\"true\">";
    foundHelper = helpers.localName;
    stack1 = foundHelper || depth0.localName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "localName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a> &gt;\n";
    return buffer;}

  function program9(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n  <optgroup label=\"";
    foundHelper = helpers.group;
    stack1 = foundHelper || depth0.group;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "group", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n    ";
    foundHelper = helpers.tags;
    stack1 = foundHelper || depth0.tags;
    stack2 = helpers.each;
    tmp1 = self.program(10, program10, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </optgroup>\n  ";
    return buffer;}
  function program10(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n    <option value=\"";
    foundHelper = helpers.tag;
    stack1 = foundHelper || depth0.tag;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "tag", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    foundHelper = helpers.selectedAttr;
    stack1 = foundHelper || depth0.selectedAttr;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selectedAttr", { hash: {} }); }
    buffer += escapeExpression(stack1) + ">";
    foundHelper = helpers.label;
    stack1 = foundHelper || depth0.label;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
    buffer += escapeExpression(stack1) + " (";
    foundHelper = helpers.tag;
    stack1 = foundHelper || depth0.tag;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "tag", { hash: {} }); }
    buffer += escapeExpression(stack1) + ")</option>\n    ";
    return buffer;}

    buffer += "<div class=\"switch clearfix\">\n  <label class=\"checkbox pull-right\">\n    <input";
    foundHelper = helpers.advanced;
    stack1 = foundHelper || depth0.advanced;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      type=\"checkbox\" value=\"1\" name=\"style_advanced\" />\n    CSS Editor\n  </label>\n  <p><a href=\"#\" data-bypass=\"true\" class=\"back-to-general\">&lsaquo; Back</a></p>\n</div>\n\n<p class=\"selector-choice\">\nElement:\n";
    foundHelper = helpers.parents;
    stack1 = foundHelper || depth0.parents;
    stack2 = helpers['if'];
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n<b>";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth0.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</b>\n</p>\n\n<select class=\"tag\">\n  <option value=\"\">Every tag</option>\n  ";
    foundHelper = helpers.htmlTags;
    stack1 = foundHelper || depth0.htmlTags;
    stack2 = helpers.each;
    tmp1 = self.program(9, program9, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</select>\n";
    return buffer;});
}});

window.require.define({"views/templates/templates": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n    <option value=\"";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.label;
    stack1 = foundHelper || depth0.label;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n    ";
    return buffer;}

    buffer += "<p>Click to change</p>\n<ul class=\"rects\"></ul>\n<form class=\"new-template-select hide\">\n  <legend>Add New Template</legend>\n  <select>\n    ";
    foundHelper = helpers.standards;
    stack1 = foundHelper || depth0.standards;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    <option value=\"\">Other</option>\n  </select>\n  <input class=\"new-template-name hide\" type=\"text\" value=\"\" placeholder=\"Enter template name\" />\n  <button class=\"new-template-add btn\">Add template</button>\n</form>\n<button class=\"new-template\">&plus; New Template</button>\n";
    return buffer;});
}});

window.require.define({"views/templates/templates_select": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n  <li";
    foundHelper = helpers.active;
    stack1 = foundHelper || depth0.active;
    stack2 = helpers['if'];
    tmp1 = self.program(2, program2, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "><a href=\"#\" data-id=\"";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.label;
    stack1 = foundHelper || depth0.label;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></li>\n  ";
    return buffer;}
  function program2(depth0,data) {
    
    
    return " class=\"active\"";}

    buffer += "<a tabindex=\"-1\" href=\"#\">Switch Template</a>\n<ul class=\"dropdown-menu\">\n  ";
    foundHelper = helpers.templates;
    stack1 = foundHelper || depth0.templates;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</ul>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<iframe id=\"theme\" name=\"theme\" src=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/edit\" frameborder=\"0\" width=\"100%\" height=\"100%\"></iframe>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme_list": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n        <div class=\"btn-group pull-right\">\n          <a class=\"btn\" href=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"><i class=\"icon-pencil\"></i></a>\n          <button class=\"btn btn-danger delete\" data-theme-id=\"";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"><i\n              class=\"icon-trash\"></i></button>\n        </div>\n        ";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n        <a class=\"btn pull-right\" href=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"><i\n            class=\"icon-eye-open\"></i> view & copy</a>\n        ";
    return buffer;}

    buffer += "<li class=\"span3\" id=\"theme-";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n  <div class=\"thumbnail\">\n    <a href=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
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
    buffer += escapeExpression(stack1) + "</h4>\n      <div>\n        ";
    foundHelper = helpers.user_is_owner;
    stack1 = foundHelper || depth0.user_is_owner;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(3, program3, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      </div>\n    </div>\n  </div>\n</li>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme_meta": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "Theme: <span class=\"name\">";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>\n";
    return buffer;});
}});

window.require.define({"views/templates/themes": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<h3 class=\"page-title\">Create a new theme from scratch</h3>\n<form id=\"new-theme\" class=\"form-inline\">\n  <input type=\"text\" class=\"input-medium\" name=\"theme_name\" placeholder=\"Theme Name\">\n  <button data-event=\"New Theme:type:from scratch\"\n    class=\"btn btn-primary\" data-bypass=\"true\">\n    Create Theme</button>\n</form>\n<h3 class=\"page-title\">Or copy a theme below</h3>\n";});
}});

window.require.define({"views/templates/user_themes": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<h1 class=\"page-header\">\n  Your Themes <small>(";
    foundHelper = helpers.count;
    stack1 = foundHelper || depth0.count;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "count", { hash: {} }); }
    buffer += escapeExpression(stack1) + ")</small>\n  <a href=\"/themes\" class=\"btn btn-primary\">Create a New Theme</a>\n</h1>\n";
    return buffer;});
}});

window.require.define({"views/templates_select": function(exports, require, module) {
  var View = require("views/base/view"),
      app = require("application"),
      template = require("views/templates/templates"),
      Templates = require("collections/templates");

  module.exports = View.extend({
    id: "templates-select",
    tagName: "li",
    className: "dropdown-submenu",

    template: "templates_select",
    collection: app.currentTheme.get("templates"),

    data: function () {
      return {
        templates: this.collection.map(function (template) {
          return {
            id: template.id,
            label: template.label(),
            active: template.get("name") === "index"
          };
        })
      };
    },

    events: {
      "click .dropdown-menu a": "switchTemplate"
    },

    initialize: function () {
      var template = this.collection.getCurrent();

      $("#page").fadeOut().empty()
        .append(template.get("full"))
        .fadeIn();

      View.prototype.initialize.call(this);
    },

    switchTemplate: function (e) {
      var id = e.currentTarget.getAttribute("data-id"),
          template = this.collection.get(id);

      e.preventDefault();

      $("#page").fadeOut().empty()
        .append(template.get("full"))
        .fadeIn();

      this.$(".active").removeClass("active");
      $(e.currentTarget.parentNode).addClass("active");
    }
  });
  
}});

window.require.define({"views/theme": function(exports, require, module) {
  var View = require("views/base/view")
    , cssProperties = require("lib/css_properties")
    , template = require("views/templates/theme");

  module.exports = View.extend({
    id: "canvas"

    , initialize: function () {
      $("body").on("mouseenter", "[name=property]", this.typeahead);
      $(window).on("resize", this.resize.bind(this));

      View.prototype.initialize.call(this);
    }

    , teardown: function () {
      $("body").off("mouseenter", "[name=property]", this.typeahead);
      $(window).off("resize", this.resize.bind(this));

      View.prototype.teardown.call(this);
    }

    , render: function () {
      this.$el.empty()
        .append(template({id: this.options.themeID}));

      this.resize();

      return this;
    }

    , typeahead: function (e) {
      $(e.currentTarget).typeahead({
        source: cssProperties
      });
    }

    , resize: function () {
      this.$el.width("100%")
        .height($(window).height() - 40);
    }
  });
  
}});

window.require.define({"views/theme_list": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/theme_list")
    , app = require("application");

  module.exports = View.extend({
      el: $("<ul class='thumbnails'></ul>")

    , events: {
      "click .delete": "confirmDeletion"
    }

    , objectEvents: {
      collection: {
        "reset": "addAll"
      }
    }

    , render: function () {
      this.collection.reset(this.collection.models);

      return this;
    }

    , addOne: function (theme) {
      this.$el.append(template({
          id: theme.id
        , screenshot_uri: theme.get("screenshot_uri")
        , name: theme.get("name")
        , author: theme.get("author")
        , user_is_owner: theme.get("author_id") === app.currentUser.id
      }));
    }

    , addAll: function () {
      this.$el.empty();

      this.collection.each(function (theme) {
        this.addOne(theme);
      }, this);
    }

    , confirmDeletion: function (e) {
      var theme_id = e.currentTarget.getAttribute("data-theme-id"),
          theme = this.collection.get(theme_id),
          message = "Are you sure you want to delete '" +
            theme.get("name") + "'? There's no going back.";

      e.preventDefault();

      if (window.confirm(message)) {
        e.currentTarget.setAttribute("disabled");

        theme.destroy({
          success: function (model) {
            app.trigger("theme:deleted", model);

            app.trigger("notification", "success",
                        "'" + model.get("name") + "' has been deleted.");
          },

          error: function (model) {
            e.currentTarget.removeAttribute("disabled");

            app.trigger("notification", "error", "Error. Unable to delete '" +
                        model.get("name") + "'. Please try again.");
          }
        });
      }
    }
  });
  
}});

window.require.define({"views/theme_meta": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/theme_meta")
    , Themes = require("collections/themes")
    , app = require("application");

  module.exports = View.extend({
    id: "theme-meta",

    appEvents: {
      "save:before": "saveThemeName"
    },

    render: function () {
      this.$el.empty()
        .append(template({name: app.data.theme.name}));

      if (app.data.theme.author_id === app.currentUser.id) {
        this.$(".name").attr("contenteditable", "true");
      }

      return this;
    },

    saveThemeName: function (attributes) {
      attributes.name = this.$(".name").text();
    }
  });

  
}});

window.require.define({"views/themes": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/themes")
    , Themes = require("collections/themes")
    , app = require("application");

  module.exports = View.extend({
    collection: new Themes(app.data.themes),

    events: {
      "submit #new-theme": "createTheme"
    },

    render: function () {
      var listView = app.createView("theme_list", {collection: this.collection});

      this.subViews.push(listView);

      this.$el.empty()
        .append(template())
        .append(listView.render().$el);

      return this;
    },

    createTheme: function (e) {
      var data = {name: this.$("input[name=theme_name]").val().trim()};

      e.preventDefault();

      if (!data.name) {
        app.trigger("notification", "error", "Please fill in the theme name");
        return;
      }

      // Set timeout so that button is disabled after all script are run
      // to avoid blocking event bubbling
      setTimeout(function () {
        this.$("button").attr("disabled", "true").html("Please wait...");
      }, 0);

      $.ajax({
        type: "POST",
        url: "/themes",
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify(data),
        success: function (data) {
          var theme = JSON.parse(data);

          app.trigger("theme:created", theme);

          Backbone.history.navigate("/themes/" + theme._id, true);
        },
        error: function () {
          this.$("button").removeAttr("disabled").html("Create Theme");

          app.trigger("notification", "error", "Unable to create a theme. " +
                      "Please try again.");
        }.bind(this)
      });
    }
  });

  
}});

window.require.define({"views/user_themes": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/user_themes")
    , app = require("application");

  module.exports = View.extend({
    collection: app.currentUser.get("themes"),

    appEvents: {
      "theme:deleted": "render"
    },

    render: function () {
      var listView = app.createView("theme_list", {collection: this.collection});

      this.subViews.push(listView);

      this.$el.empty()
        .append(template({count: this.collection.length}))
        .append(listView.render().$el);

      return this;
    }
  });

  
}});

