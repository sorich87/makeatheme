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
      this.reuseView("notifications").render()
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

      this.on("upload:after", this.updateCurrentUserThemes);
    }

    , updateCurrentUserThemes: function (theme) {
      this.currentUser.get("themes").add(theme);
    }

    , authRedirect: function () {
      this.on("login", this.historyBack);
      this.on("registration", this.historyBack);
    }

    , historyBack: function () {
      if ($("#main").children().length === 0) {
        Backbone.history.navigate("/", true);
      } else {
        Backbone.history.back(true);
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

      if (! current) {
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
   *
   * Create empty hash in values and indexes as well.
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
      this.deleteRule(index);
    } else if (overwrite) {
      index = this.getIndex(rule);
      this.deleteRule(index);
    }
    index = this.sheets[media].cssRules.length;

    declaration = rule.selector + " {" + rule.property + ": " + rule.value + "}";

    this.sheets[media].insertRule(declaration, index);

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

      if (this.rules[rule.media][index].selector === rule.selector) {
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

      for (index in this.rules[media]) {
        rule = this.rules[media][index];

        selectorWithoutPseudo = rule.selector.replace(/:[^,\s]*\w/g, "").trim();

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

      for (i in mediaDeclarations) {
        if (!mediaDeclarations.hasOwnProperty(i)) {
          continue;
        }

        l = allDeclarations[media].length;

        allDeclarations[media][l] = mediaDeclarations[i];
      }

      allDeclarations[media].reverse().sort(sortBySpecificity);
    }

    return allDeclarations;
  };

  /**
   * Get rules in the format used on the server
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

    this.sheets[media].deleteRule(index);

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
    sessionStorage.setItem("theme-" + app.data.theme._id, store);
  }, 1000);

  module.exports = data;
  
}});

window.require.define({"lib/html_tags": function(exports, require, module) {
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

  Handlebars.registerHelper("currentUser", function () {
    if (app.currentUser.id) {
      return app.currentUser;
    }
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
        "": "themes"
      , "me/themes": "your_themes"
      , "themes/:id": "theme"
      , "themes/:id/edit": "edit"
      , "login": "login"
      , "register": "register"
      , "reset_password": "reset_password"
      , "upload": "upload"
      , "*actions": "notFound"
    }

    , themes: function () {
      this.userOnly();

      var collection = new Themes(app.data.themes);

      $("#main").empty()
        .append("<div id='new-button'><a href='/themes/new' " +
                "data-event='New Theme:type:from scratch'" +
                "class='btn btn-primary btn-large' data-bypass='true'>" +
                "Create a New Theme</a></div>")
        .append("<h3 class='page-title'>Or copy a theme below</h3>")
        .append(app.createView("theme_list", {collection: collection}).render().$el);
    }

    , your_themes: function () {
      this.userOnly();

      var collection = app.currentUser.get("themes");

      $("#main").empty()
        .append("<h1 class='page-header'>Your Themes <small>(" + collection.length + ")</small></h1>")
        .append(app.createView("theme_list", {collection: collection}).render().$el);
    }

    , theme: function (id) {
      app.reuseView("theme", {
          themeID: id
        , el: $("#main")
      }).render();
    }

    , edit: function (id) {
      if (app.data.theme === void 0) {
        window.top.Backbone.history.navigate("/404", {trigger: true, replace: true});
        return;
      }

      app.createView("editor").render();
    }

    , login: function () {
      this.anonymousOnly();

      $(".modal").modal("hide");

      $("body").append(app.createView("login").render().$el.modal("show"));
    }

    , register: function () {
      this.anonymousOnly();

      $(".modal").modal("hide");

      $("body").append(app.createView("register").render().$el.modal("show"));
    }

    , reset_password: function () {
      this.anonymousOnly();

      $(".modal").modal("hide");

      $("body").append(app.createView("password_reset").render().$el.modal("show"));
    }

    , upload: function () {
      $(".modal").modal("hide");

      $("body").append(app.createView("theme_upload").render().$el.modal("show"));
    }

    , notFound: function (action) {
      $("#main").empty()
        .append(app.reuseView("not_found").render().$el);
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
      var links = template();

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
            sessionStorage.clear();

            app.trigger("logout");

            setTimeout(function () {
              window.location = "/";
            });
          }
        }.bind(this)
      });
    }
  });
  
}});

window.require.define({"views/base/view": function(exports, require, module) {
  require("lib/view_helpers");

  module.exports = Backbone.View.extend({
    render: function () {
      var data;

      if (this.template) {
        data = _.isFunction(this.data) ? this.data() : this.data;

        this.$el.empty().append(require("views/templates/" + this.template)(data));
      }

      return this;
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

    , initialize: function () {
      this.collection.on("reset", this.addAll, this);
      this.collection.on("add", this.addOne, this);
      this.collection.on("remove", this.removeOne, this);

      app.on("mutations:started", this.makeMutable.bind(this));
      app.on("save:before", this.addThemeAttributes.bind(this));
      app.on("block:inserted", this.insertBlock.bind(this));

      this.allBlocks = _.map(app.data.blocks, function (block) {
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
      var block = this.collection.getByCid($(element).data("cid"));

      element.outerHTML = "<div id='" + id + "' class='columns " +
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

      attributes = _.find(this.allBlocks, function (block) {
        return block.name === name;
      });

      build = (new DOMParser()).parseFromString(attributes.template, "text/html").body;
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

window.require.define({"views/download_button": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application")
    , download_button = require("views/templates/download_button");

  module.exports = View.extend({
      id: "download-button"

    , events: {
      "click button.x-login": "login"
    }

    , initialize: function () {
      app.on("save:after", this.waitForArchive.bind(this));
    }

    , render: function () {
      var button;

      this.$el.empty().append(download_button({id: app.data.theme._id}));

      if (!app.data.theme.has_archive) {
        this.$el.hide();
      }

      return this;
    }

    , login: function () {
      window.top.Backbone.history.navigate("/login", true);
    }

    , download: function (e) {
      var $iframe = $("#download-iframe", window.top.document)
        , url = "/themes/" + app.data.theme._id + "/download";

      e.preventDefault();

      if ($iframe.length === 0) {
        $iframe = $("<iframe id='download-iframe' width='0' height='0' src='" + url + "'></iframe>")
          .appendTo($("body", window.top.document));
      } else {
        $iframe.attr("src", url);
      }
    }

    , waitForArchive: function (theme) {
      var button = this.$("button")[0]
        , eventSource = new EventSource("/jobs/" + theme.get("archive_job_id"));

      this.$el.show();

      button.setAttribute("disabled", "true");
      button.innerHTML = "Rebuilding archives...";

      eventSource.addEventListener("success", this.archiveSuccess.bind(this), false);
      eventSource.addEventListener("errors", this.archiveErrors.bind(this), false);
    }

    , resetButton: function (e) {
      var button = this.$("button")[0];

      e.currentTarget.close();

      button.removeAttribute("disabled");
      button.innerHTML = "Download Theme <span class='caret'></span>";
    }

    , archiveSuccess: function (e) {
      this.resetButton(e);

      app.trigger("notification", "success", "Theme archives updated.");
    }

    , archiveErrors: function (e) {
      this.resetButton(e);

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
    panels: [
        {
          id: "templates"
        , title: "Current Template"
      }
      , {
          id: "regions"
        , title: "Header &amp; Footer"
      }
      , {
          id: "blocks"
        , title: "Blocks"
      }
      , {
          id: "style_edit"
        , title: "Style"
      }
      , {
          id: "share_link"
        , title: "Share"
      }
    ]

    , initialize: function () {
      _.bindAll(this, "accordionGroups");
    }

    , render: function () {
      app.createView("regions");
      app.createView("blocks");
      app.createView("style_edit");
      app.createView("share_link");
      app.createView("save_button");
      app.createView("download_button");

      // Setup drag and drop and resize
      app.createView("layout").render();

      this.$el.empty()
        .append("<div class='accordion'>" + this.accordionGroups() + "</div>")
        .append(app.reuseView("save_button").render().$el)
        .append(app.reuseView("download_button").render().$el);

      for (var i in this.panels) {
        if (!this.panels.hasOwnProperty(i)) {
          return;
        }

        this.$("#editor-" + this.panels[i].id + " .accordion-inner")
          .empty()
          .append(app.reuseView(this.panels[i].id).render().$el);
      }

      document.body.className = "editor";

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
    , accordion_group = require("views/templates/accordion_group")
    , copy_button = require("views/templates/copy_button");

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
    }

    // Show editor when "template:loaded" event is triggered
    , render: function () {
      var actions_view;

      this.$el.empty()
        .append("<div id='theme-name'>Theme: " + app.data.theme.name + "</div>");

      if (app.data.theme.author_id === app.currentUser.id) {
        actions_view = "edit_actions";
      } else {
        actions_view = "preview_actions";
      }

      this.$el.append(app.createView(actions_view).render().$el);

      if (!app.editor.preview_only) {
        this.$el.append(app.createView("download_button").render().$el);
      }

      this.$el.appendTo($("#main", window.top.document));

      this.resize();
      this.preventActions();

      return this;
    }

    , resize: function () {
      this.$el.height($(window.top).height() - 60);
    }

    // Prevent click, drag and submit on links, images and forms
    // respectively in the iframe
    , preventActions: function () {
      $("body").on("click", ".columns a", this.preventDefault)
        .on("mousedown", ".columns a, .columns img", this.preventDefault)
        .on("submit", ".columns form", this.preventDefault);
    }

    , preventDefault: function (e) {
      e.preventDefault();
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
        "click .columns": "highlightColumns"

        // Remove column
      , "click .columns .x-remove": "removeColumn"

      , "mouseenter .column, .columns": "makeDraggable"

      , "mouseenter .row": "makeDroppable"

      , "mouseenter .x-resize": "makeResizeable"
    }

    , initialize: function () {
      this.makeDroppable();
      app.on("region:loaded", this.highLightEmpty.bind(this));
      app.on("template:loaded", this.highLightEmpty.bind(this));
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
      this.$(".column, .columns").draggable({
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
          accept: ".column, .columns, .x-drag"
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
              this.model.set("themes", new Themes(response.themes));

              this.$el.modal("hide");

              app.trigger("login", this.model);
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

window.require.define({"views/preview_actions": function(exports, require, module) {
  var app = require("application")
    , View = require("views/base/view")
    , data = require("lib/editor_data")
    , mutations = require("lib/mutations")
    , accordion_group = require("views/templates/accordion_group")
    , copy_button = require("views/templates/copy_button");

  module.exports = View.extend({
    id: "layout-editor"

    , events: {
      "click #customize-button a.copy": "askForPatience"
    }

    , render: function () {
      this.$el.empty()
        .append(app.createView("templates_select").render().$el)
        .append(copy_button({theme_id: app.data.theme._id}));

      return this;
    }

    , askForPatience: function (e) {
      e.currentTarget.setAttribute("disabled", "true");
      e.currentTarget.innerHTML = "Started the Photocopier";
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

    , initialize: function () {
      _.bindAll(this, "addThemeAttributes", "makeMutable", "addRegionsToTemplate");

      this.collection.on("add", this.addOne, this);

      app.on("save:before", this.addThemeAttributes);
      app.on("mutations:started", this.makeMutable);
      app.on("template:load", this.addRegionsToTemplate);
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

          this.$el.modal("hide");

          app.trigger("registration", model);
          app.trigger("notification", "success", "Your registration was successful. You are now logged in.");
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

window.require.define({"views/save_button": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application")
    , save_button = require("views/templates/save_button");

  module.exports = View.extend({
      id: "save-button"

    , events: {
      "click button.save": "save"
    }

    , render: function () {
      this.$el.empty().append(save_button());

      return this;
    }

    , save: function (e) {
      var attrs = _.clone(app.data.theme);

      e.target.setAttribute("disabled", "true");

      app.trigger("save:before", attrs);

      app.currentUser.get("themes").create(attrs, {
        success: function (theme) {
          app.trigger("save:after", theme);

          e.target.removeAttribute("disabled");

          app.trigger("notification", "success", "Theme saved.");

          window.top.Backbone.history.navigate("/themes/" + theme.id, true);
        }
        , error: function (theme, response) {
          app.trigger("save:error");

          e.target.removeAttribute("disabled");

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
      theme: app.data.theme._id
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

      , "click .add-rule": "addRuleInputs"
      , "keyup .rules input": "editRule"
      , "change .rules input": "editRule"

      , "click .add-declaration": "addDeclarationInputs"
      , "keyup .selector input": "editDeclaration"
      , "change .selector input": "editDeclaration"
    }

    , initialize: function () {
      app.on("column:highlight", this.setColumn.bind(this));
      app.on("save:before", this.addThemeAttributes.bind(this));
      app.on("resize:end", this.changeWidth.bind(this));

      this.selector = "body";
      this.customCSS = app.editor.style;
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
      var selector, $element, declarations;

      this.media = "all";

      if (this.tag && ["body", "html"].indexOf(this.selector) != -1) {
        selector = this.tag;
      } else {
        if (this.tag) {
          selector = this.selector + " " + this.tag;
        } else {
          selector = this.selector;
        }
        $element = $(selector);
        if ($element) {
          selector = $element[0];
        }
      }

      declarations = this.customCSS.getDeclarations(selector);
      if (declarations && declarations[this.media]) {
        declarations =  declarations[this.media];
      } else {
        declarations = [];
      }

      this.$el.html(template({
          htmlTags: this.tagOptions()
        , selector: this.selector
        , parents: $(this.selector).parents().get().reverse()
        , declarations: declarations
      }));

      this.markNonAppliedRules();

      return this;
    }

    , tagOptions: function () {
      var _this = this;

      return html_tags.map(function (group) {
        group.tags = group.tags.map(function (tag) {
          tag.selected = tag.tag === _this.tag ? " selected" : "";
          return tag;
        });
        return group;
      });
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
        index = this.customCSS.insertRule({
            selector: selector
          , property: property
          , value: value
          , index: index
          , media: this.media
        });
      } else {
        if (index) {
          this.customCSS.deleteRule(index, this.media);
          index = "";
        }

        if (!property && !value && e.type === "change") {
          $li.remove();
        }
      }

      $li.find("input[name=index]").val(index);
    }

    , addDeclarationInputs: function (e) {
      var selector = this.selector;

      e.preventDefault();

      if (this.tag) {
        selector = this.selector + " " + this.tag;
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

    , highlightElement: function (e) {
      var selector = e.currentTarget.getAttribute("data-selector");

      e.preventDefault();

      $(".x-current").removeClass("x-current");
      $(selector).addClass("x-current");

      this.selector = selector;
      this.render();
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

    , initialize: function (options) {
      _.bindAll(this, "addThemeAttributes", "makeMutable", "saveRegion");

      this.collection.on("add", this.addOne, this);
      this.collection.on("reset", this.addAll, this);
      this.collection.on("remove", this.removeOne, this);

      app.on("save:before", this.addThemeAttributes);
      app.on("mutations:started", this.makeMutable);
      app.on("region:load", this.saveRegion);
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
      var template = this.collection.getByCid(this.$("ul input:checked").val());

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

window.require.define({"views/templates/auth_links": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this;

  function program1(depth0,data) {
    
    
    return "\n  <ul class=\"nav\">\n    <li><a href=\"/\" id=\"your_themes\">New theme</a></li>\n    <li><a href=\"/me/themes\" id=\"your_themes\">Your themes</a></li>\n    <li><button class=\"btn\" id=\"logout\">Log out</button></li>\n  </ul>\n";}

  function program3(depth0,data) {
    
    
    return "\n  <ul class=\"nav\">\n    <li><a id=\"register\" href=\"/register\">Register</a></li>\n    <li><a id=\"login\" href=\"/login\">Log in</a></li>\n  </ul>\n";}

    foundHelper = helpers.currentUser;
    stack1 = foundHelper || depth0.currentUser;
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

window.require.define({"views/templates/copy_button": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n    <a class=\"btn btn-primary btn-block copy\" data-bypass=\"true\"\n      data-event=\"New Theme:type:copy\" href=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/fork\">Copy Theme</a>\n  ";
    return buffer;}

  function program3(depth0,data) {
    
    
    return "\n    <a class=\"btn btn-primary\" href=\"/login\">Login to Copy</a>\n  ";}

    buffer += "<div id=\"customize-button\">\n  ";
    foundHelper = helpers.currentUser;
    stack1 = foundHelper || depth0.currentUser;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(3, program3, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/declaration": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<form class=\"declaration-inputs\">\n  <p class=\"selector\">\n    <input value=\"";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth0.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" placeholder=\"selector\" />&nbsp; {\n  </p>\n  <ul class=\"rules\">\n  </ul>\n  <button class=\"btn btn-mini add-rule\">Add rule</button>\n  <p>}</p>\n</form>\n";
    return buffer;});
}});

window.require.define({"views/templates/download_button": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  <div class=\"btn-group btn-block\">\n    <button data-toggle=\"dropdown\"\n      class=\"btn btn-success btn-block dropdown-toggle download\">\n      Download Theme <span class=\"caret\"></span>\n    </button>\n    <ul class=\"dropdown-menu\">\n      <li><a href=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/download\" data-event=\"Download:format:HTML\"\n        target=\"_blank\" data-bypass=\"true\">Download HTML5</a></li>\n      <li><a href=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/download/wordpress\"\n        data-event=\"Download:format:WordPress\"\n        target=\"_blank\" data-bypass=\"true\">Download WordPress</a></li>\n    </ul>\n  </div>\n";
    return buffer;}

  function program3(depth0,data) {
    
    
    return "\n  <button class='btn btn-success x-login'>Login to Download</button>\n";}

    foundHelper = helpers.currentUser;
    stack1 = foundHelper || depth0.currentUser;
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

window.require.define({"views/templates/login": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Please authenticate yourself</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"email\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" name=\"password\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Log In</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Forgot your password? <a href=\"/reset_password\" data-dismiss=\"modal\">Reset password</a></li>\n    <li>Don't have an account yet? <a href=\"/register\" data-dismiss=\"modal\">Register</a></li>\n  </ul>\n</div>\n";});
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


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Reset password</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\" id=\"password_reset\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"email\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"password\">New Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" name=\"password\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Send reset email</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Remember your password? <a href=\"/login\" data-dismiss=\"modal\">Log in</a></li>\n    <li>Don't have an account yet? <a href=\"/register\" data-dismiss=\"modal\">Register</a></li>\n  </ul>\n</div>\n";});
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


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Create a free account</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-first-name\">First Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"first_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-last-name\">Last Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"last_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"email\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" class=\"input-xlarge\" name=\"password\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password-confirmation\">Password Confirmation</label>\n        <div class=\"controls\">\n          <input type=\"password\" class=\"input-xlarge\" name=\"password_confirmation\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary submit\">Register</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Already have an account? <a href=\"/login\" data-dismiss=\"modal\">Log in</a></li>\n  </ul>\n</div>\n";});
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

window.require.define({"views/templates/save_button": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this;

  function program1(depth0,data) {
    
    
    return "\n  <button class=\"btn btn-primary btn-block save\">Save Changes</button>\n";}

    foundHelper = helpers.currentUser;
    stack1 = foundHelper || depth0.currentUser;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n\n";
    return buffer;});
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

window.require.define({"views/templates/style_edit": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n  ";
    foundHelper = helpers.parents;
    stack1 = foundHelper || depth0.parents;
    stack2 = helpers.each;
    tmp1 = self.program(2, program2, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  ";
    return buffer;}
  function program2(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n  ";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    stack2 = helpers['if'];
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(5, program5, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  ";
    return buffer;}
  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  <a href=\"#\" data-selector=\"#";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" data-bypass=\"true\">#";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a> &gt;\n  ";
    return buffer;}

  function program5(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  <a href=\"#\" data-selector=\"";
    foundHelper = helpers.localName;
    stack1 = foundHelper || depth0.localName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "localName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" data-bypass=\"true\">";
    foundHelper = helpers.localName;
    stack1 = foundHelper || depth0.localName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "localName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a> &gt;\n  ";
    return buffer;}

  function program7(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n    <optgroup label=\"";
    foundHelper = helpers.group;
    stack1 = foundHelper || depth0.group;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "group", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n      ";
    foundHelper = helpers.tags;
    stack1 = foundHelper || depth0.tags;
    stack2 = helpers.each;
    tmp1 = self.program(8, program8, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </optgroup>\n    ";
    return buffer;}
  function program8(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n      <option value=\"";
    foundHelper = helpers.tag;
    stack1 = foundHelper || depth0.tag;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "tag", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    foundHelper = helpers.selected;
    stack1 = foundHelper || depth0.selected;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selected", { hash: {} }); }
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
    buffer += escapeExpression(stack1) + ")</option>\n      ";
    return buffer;}

  function program10(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n  <form class=\"declaration-inputs\">\n    <p class=\"selector\">\n      <input value=\"";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth0.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" placeholder=\"selector\" />&nbsp; {\n    </p>\n    <ul class=\"rules\">\n      ";
    foundHelper = helpers.rules;
    stack1 = foundHelper || depth0.rules;
    stack2 = helpers.each;
    tmp1 = self.programWithDepth(program11, data, depth0);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </ul>\n    <button class=\"btn btn-mini add-rule\">Add rule</button>\n    <p>}</p>\n  </form>\n  ";
    return buffer;}
  function program11(depth0,data,depth1) {
    
    var buffer = "", stack1;
    buffer += "\n      <li>\n        <input name=\"property\" value=\"";
    foundHelper = helpers.property;
    stack1 = foundHelper || depth0.property;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "property", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" placeholder=\"property\" />:\n        <input name=\"value\" value=\"";
    foundHelper = helpers.value;
    stack1 = foundHelper || depth0.value;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "value", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" placeholder=\"value\" />\n        <input type=\"hidden\" name=\"index\" value=\"";
    foundHelper = helpers.index;
    stack1 = foundHelper || depth0.index;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "index", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n        <input type=\"hidden\" name=\"selector\" value=\"";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth1.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n      </li>\n      ";
    return buffer;}

    buffer += "  <p class=\"selector-choice\">\n  Element:\n  ";
    foundHelper = helpers.parents;
    stack1 = foundHelper || depth0.parents;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <b>";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth0.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</b>\n  </p>\n\n  <select class=\"tag\">\n    <option value=\"\">Every tag</option>\n    ";
    foundHelper = helpers.htmlTags;
    stack1 = foundHelper || depth0.htmlTags;
    stack2 = helpers.each;
    tmp1 = self.program(7, program7, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </select>\n\n  ";
    foundHelper = helpers.declarations;
    stack1 = foundHelper || depth0.declarations;
    stack2 = helpers.each;
    tmp1 = self.program(10, program10, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <button class=\"btn add-declaration\">Add declaration</button>\n";
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
    
    var buffer = "", stack1;
    buffer += "\n  <option value=\"";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    foundHelper = helpers.selected;
    stack1 = foundHelper || depth0.selected;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selected", { hash: {} }); }
    buffer += escapeExpression(stack1) + ">";
    foundHelper = helpers.label;
    stack1 = foundHelper || depth0.label;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n  ";
    return buffer;}

    buffer += "<label>Previewing template:</label>\n<select>\n  ";
    foundHelper = helpers.templates;
    stack1 = foundHelper || depth0.templates;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n</select>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<div id=\"canvas\">\n  <iframe id=\"theme\" name=\"theme\" src=\"/themes/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "/edit\" frameborder=\"0\" width=\"100%\" height=\"100%\"></iframe>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme_list": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n      <p>by <a href=\"#\">";
    foundHelper = helpers.author;
    stack1 = foundHelper || depth0.author;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "author", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></p>\n      ";
    return buffer;}

    buffer += "<li class=\"span3\">\n  <div class=\"thumbnail\">\n    <a href=\"";
    foundHelper = helpers.uri;
    stack1 = foundHelper || depth0.uri;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "uri", { hash: {} }); }
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
    buffer += escapeExpression(stack1) + "</h4>\n      ";
    foundHelper = helpers.author;
    stack1 = foundHelper || depth0.author;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      <div>\n        <a class=\"btn btn-primary pull-right\" href=\"";
    foundHelper = helpers.uri;
    stack1 = foundHelper || depth0.uri;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "uri", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"><i class=\"icon-pencil icon-white\"></i> ";
    foundHelper = helpers.edit_text;
    stack1 = foundHelper || depth0.edit_text;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "edit_text", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a>\n      </div>\n    </div>\n  </div>\n</li>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme_upload": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Upload a new theme</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"file\">Theme Archive</label>\n        <div class=\"controls\">\n          <input type=\"file\" name=\"file\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Upload Theme</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n</div>\n";});
}});

window.require.define({"views/templates_select": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application")
    , Template = require("models/template")
    , template = require("views/templates/templates");

  module.exports = View.extend({
      id: "templates-preview"
    , className: "x-section"
    , template: "templates_select"
    , collection: app.editor.templates

    , initialize: function () {
      var template = this.collection.getCurrent();

      $("#page").fadeOut().empty()
        .append(template.get("full"))
        .fadeIn();
    }

    , data: {
      templates: app.editor.templates.map(function (template) {
        return {
            id: template.id
          , label: template.label()
          , selected: template.get("name") === "index" ? " selected='selected'" : ""
        };
      })
    }

    , events: {
      "change select": "switchTemplate"
    }

    , switchTemplate: function () {
      var template = this.collection.get(this.$("select").val());

      $("#page").fadeOut().empty()
        .append(template.get("full"))
        .fadeIn();
    }
  });
  
}});

window.require.define({"views/theme": function(exports, require, module) {
  var View = require("views/base/view")
    , application = require("application")
    , cssProperties = require("lib/css_properties")
    , template = require("views/templates/theme");

  module.exports = View.extend({
    initialize: function () {
      $("body").on("mouseenter", "[name=property]", function (e) {
        $(e.currentTarget).typeahead({
          source: cssProperties
        });
      });

      $(window).on("resize", this.resize.bind(this));
    }

    , render: function () {
      this.$el.empty()
        .append(template({id: this.options.themeID}));

      this.resize();

      return this;
    }

    , resize: function () {
      this.$("#canvas").width($(window).width() - 250)
        .height($(window).height() - 60);
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
      var currentUserIsOwner = theme.get("author_id") === app.currentUser.id;

      this.$el.append(template({
          uri: "/themes/" + theme.id
        , screenshot_uri: theme.get("screenshot_uri")
        , name: theme.get("name")
        , author: theme.get("author")
        , edit_text: currentUserIsOwner ? "Edit" : "View & Copy"
      }));
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
      button.innerHTML = "Processing...";

      $form.children(".alert-error").remove();

      app.trigger("upload:before");

      $.ajax({
          type: "POST"
        , url: "/themes"
        , data: new FormData($form[0])

        , success: function (data, textStatus, jqXHR) {
          var eventSource = new EventSource("/jobs/" + data.job_id);

          eventSource.addEventListener("success", this.themeUploaded.bind(this), false);
          eventSource.addEventListener("errors", this.themeErrors.bind(this), false);
        }.bind(this)

        , error: function (jqXHR, textStatus, errorThrown) {
          $form.prepend("<p class='alert alert-error'>" + errorThrown +
                        " Please refresh the page and try again.</p>");

          button.removeAttribute("disabled");
          button.innerHTML = "Upload Theme";
        }

        , cache: false
        , contentType: false
        , dataType: "json"
        , processData: false
      });
    }

    , themeUploaded: function (e) {
      var theme = JSON.parse(e.data);

      e.currentTarget.close();

      app.trigger("upload:after", theme);
      app.trigger("notification", "success", "Your theme is uploaded and ready to be edited!");

      this.$el.modal("hide");

      Backbone.history.navigate("/themes/" + theme._id, true);
    }

    , themeErrors: function (e) {
      var key
        , errors = JSON.parse(e.data)
        , button = this.$("button[type=submit]")[0];

      e.currentTarget.close();

      for (key in errors) {
        if (errors.hasOwnProperty(key)) {
          this.$("form").prepend("<p class='alert alert-error'>" + _.str.humanize(key) + " " + errors[key] + "</p>");
        }
      }

      button.removeAttribute("disabled");
      button.innerHTML = "Upload Theme";
    }
  });
  
}});

