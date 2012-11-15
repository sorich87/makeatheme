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
