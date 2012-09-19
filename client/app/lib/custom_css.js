// Manage custom css in the document <head>
// and a 'rules' hash for easy access

var CustomCSS = function () {
  var node = document.createElement("style");

  node.type = "text/css";
  node.rel = "alternate stylesheet";

  document.head.appendChild(node);

  this.node = node;
  this.sheet = node.sheet;
  this.rules = {};
};

CustomCSS.prototype.insertRule = function (selector, property, value) {
  var index;

  if (!selector || !property || !value) {
    return false;
  }

  this.deleteRule(selector, property);

  index = this.sheet.cssRules.length;

  try {
    this.sheet.insertRule(selector + " {" + property + ": " + value + "}", index);
  } catch (e) {
    return false;
  }

  this.rules[selector] = this.rules[selector] || {};
  this.rules[selector][property] = {
      value: value
    , index: index
  };

  return true;
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
    return false;
  }

  if (!this.rules[selector] || !this.rules[selector][property]) {
    return false;
  }

  this.sheet.deleteRule(this.rules[selector][property].index);

  delete this.rules[selector][property];

  return true;
};

module.exports = CustomCSS;
