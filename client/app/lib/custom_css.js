/**
 * Manage custom css in the document <head>
 * and two 'values' and 'indexes' hashes for easy access.
 */
var CustomCSS = function (rules) {
  this.sheets = {};
  this.values = {};
  this.indexes = {};

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

  this.sheets[media] = {
      node: node
    , sheet: node.sheet
    , rules: node.sheet.cssRules
  };

  this.values[media] = {};
  this.indexes[media] = {};

  return this.sheets[media];
};

/**
 * Insert a rule in the specified media stylesheet
 * and in the values and indexes hashes.
 *
 * Create the stylesheet if didn't exist.
 *
 * Take an a hash containing:
 * selector, property and value as required attributes
 * media and index as optional attributes
 *
 * Default media is "all".
 * Default index is taken from the indexes hash if the rule previously existed
 * or the stylesheet rules length if not.
 */
CustomCSS.prototype.insertRule = function (rule) {
  var index
    , media = rule.media || "all";

  if (!rule.selector || !rule.property || rule.value === void 0) {
    return;
  }

  this.sheets[media] = this.sheets[media] || this.createSheet(media);

  if (rule.index !== null && rule.index !== void 0) {
    index = rule.index;
    this.deleteRule(index);

  } else if (this.indexes[media][rule.selector] &&
             this.indexes[media][rule.selector][rule.property]) {
    index = this.indexes[media][rule.selector][rule.property];
    this.deleteRule(index);

  } else {
    index = this.sheets[media].rules.length;
  }

  this.sheets[media].sheet.insertRule(
    rule.selector + " {" + rule.property + ": " + rule.value + "}", index);

  this.values[media][rule.selector] = this.values[media][rule.selector] || {};
  this.values[media][rule.selector][rule.property] = rule.value;

  this.indexes[media][rule.selector] = this.indexes[media][rule.selector] || {};
  this.indexes[media][rule.selector][rule.property] = index;

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
 * Get a value from a selector, property and media.
 *
 * If media is not specified, default is "all".
 */
CustomCSS.prototype.getValue = function (selector, property, media) {
  if (!selector || !property) {
    return;
  }

  media = media || "all";

  if (!this.values[media][selector] ||
      !this.values[media][selector][property]) {
    return this.values[media][selector][property];
  }
};

/**
 * Delete a rule by its index.
 *
 * Delete from stylesheet as well as indexes and values hashes.
 */
CustomCSS.prototype.deleteRule = function (index, media) {
  var selector, property;

  if (index === null || index === void 0) {
    return;
  }

  media = media || "all";

  this.sheets[media].deleteRule(index);

  for (property in this.indexes[media][selector]) {
    if (!this.indexes[media][selector].hasOwnProperty(property)) {
      continue;
    }

    if (this.indexes[media][selector][property] === index) {
      delete this.indexes[media][selector][property];
      delete this.values[media][selector][property];
      return;
    }
  }
};

module.exports = CustomCSS;
