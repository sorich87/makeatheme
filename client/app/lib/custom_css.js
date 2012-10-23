/**
 * Manage custom css in the document <head>
 * and maintain a rules object for easy access.
 *
 * Takes a rules argument with rules as an object
 * and a baseURI argument to append before assets directories.
 */
var CustomCSS = function (rules, baseURI) {
  this.sheets = {};
  this.rules = {};
  this.baseURI = baseURI;

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
CustomCSS.prototype.insertRule = function (rule) {
  var index, value
    , media = rule.media || "all";

  if (!rule.selector || !rule.property || rule.value === void 0) {
    return;
  }

  this.sheets[media] = this.sheets[media] || this.createSheet(media);

  if (rule.index !== null && rule.index !== void 0) {
    index = rule.index;
    this.deleteRule(index);
  } else {
    index = this.sheets[media].cssRules.length;
  }

  value = rule.value.replace(/url\(([^)]+)\)/g, 'url("' + this.baseURI + '/$1")');

  declaration = rule.selector + " {" + rule.property + ": " + value + "}";

  this.sheets[media].insertRule(declaration, index);

  this.rules[media] = this.rules[media] || {};
  this.rules[media][index] = {
      selector: rule.selector
    , property: rule.property
    , value: value
  };

  return index;
};

/**
 * Insert several routes at once in stylesheets.
 *
 * Take an hash of media => rules hashes.
 *
 * Call insertRule to actually insert individual rules.
 */
CustomCSS.prototype.insertRules = function (css) {
  var media, selector, property;

  for (media in css) {
    if (!css.hasOwnProperty(media)) {
      continue;
    }

    for (selector in css[media]) {
      if (!css[media].hasOwnProperty(selector)) {
        continue;
      }

      for (property in css[media][selector]) {
        if (!css[media][selector].hasOwnProperty(property)) {
          continue;
        }

        this.insertRule({
            selector: selector
          , property: property
          , value: css[media][selector][property]
          , media: media
        });
      }
    }
  }
};

/**
 * Get all declarations for an element, grouped per media and selector.
 */
CustomCSS.prototype.getDeclarations = function (element) {
  var media, rule, value, index, i, l
    , allDeclarations = {}
    , mediaDeclarations = {}
    , returnValues = function (v) { return v; };

  if (!element) {
    return;
  }

  element = $(element);

  for (media in this.rules) {
    if (!this.rules.hasOwnProperty(media)) {
      continue;
    }

    mediaDeclarations = {};

    for (index in this.rules[media]) {
      rule = this.rules[media][index];

      if (!element.is(rule.selector)) {
        continue;
      }

      if (!mediaDeclarations[rule.selector]) {
        mediaDeclarations[rule.selector] = {
            selector: rule.selector
          , rules: []
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
  }

  return allDeclarations;
};

CustomCSS.prototype.getRules = function () {
  var media, index, selector, property, value
    , rules = {};

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

      rules[media][rule.selector] = rules[media][rule.selector] || {};
      rules[media][rule.selector][rule.property] = rule.value;
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

module.exports = CustomCSS;
