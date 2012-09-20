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
