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
  var index = this.sheet.cssRules.length;

  this.deleteRule(selector, property);

  this.sheet.insertRule(selector + "{" + property + ": " + value + "}", index);

  this.rules[selector] = this.rules[selector] || {};
  this.rules[selector][property] = {
      value: value
    , index: index
  };
};

CustomCSS.prototype.getRule = function (selector, property) {
  if (this.rules[selector] && this.rules[selector][property]) {
    return this.rules[selector][property].value;
  }
};

CustomCSS.prototype.deleteRule = function (selector, property) {
  if (this.rules[selector] && this.rules[selector][property]) {
    this.sheet.deleteRule(this.rules[selector][property].index);

    delete this.rules[selector][property];
  }
};

module.exports = CustomCSS;
