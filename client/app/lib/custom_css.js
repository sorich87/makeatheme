// Manage custom css in the document <head>
// and a 'rules' hash for easy access

var CustomCSS = function (rules) {
  var node = document.createElement("style");

  node.type = "text/css";
  node.rel = "stylesheet";

  document.head.appendChild(node);

  this.node = node;
  this.sheet = node.sheet;

  this.insertRules(rules);
};

CustomCSS.prototype.insertRule = function (selector, property, value, index) {
  if (index !== null && index !== void 0) {
    this.deleteRule(index);
  } else if (this.rules[selector] && this.rules[selector][property]) {
    index = this.rules[selector][property].index;
    this.deleteRule(index);
  } else {
    index = this.sheet.cssRules.length;
  }

  if (!selector || !property || !value) {
    return;
  }

  this.rules[selector] = this.rules[selector] || {};
  this.rules[selector][property] = {
      value: value
    , index: index
  };

  this.sheet.insertRule(selector + " {" + property + ": " + value + "}", index);

  return index;
};

CustomCSS.prototype.insertRules = function (rules) {
  var rule, selector, property;

  rules = rules || {};

  for (selector in rules) {
    if (!rules.hasOwnProperty(selector)) {
      continue;
    }

    for (property in rules[selector]) {
      if (!rules[selector].hasOwnProperty(property)) {
        continue;
      }

      rule = rules[selector][property];

      this.sheet.insertRule(selector + " {" + property + ": " + rule.value + "}", this.sheet.rules.length);
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

CustomCSS.prototype.deleteRule = function (index) {
  var selector, property;

  if (index === null || index === void 0) {
    return;
  }

  this.sheet.deleteRule(index);

  for (selector in this.rules) {
    if (!this.rules.hasOwnProperty(selector)) {
      continue;
    }

    for (property in this.rules[selector]) {
      if (!this.rules[selector].hasOwnProperty(property)) {
        continue;
      }

      if (this.rules[selector][property].index === index) {
        return delete this.rules[selector][property];
      }
    }
  }
};

CustomCSS.prototype.toString = function () {
  var selector, property
    , string = "";

  if (!this.rules || this.rules.length === 0) {
    return;
  }

  for (selector in this.rules) {
    if (!this.rules.hasOwnProperty(selector)) {
      continue;
    }

    string += selector + " {\n";

    for (property in this.rules[selector]) {
      if (!this.rules[selector].hasOwnProperty(property)) {
        continue;
      }

      string += property + ": " + this.rules[selector][property].value + ";\n";
    }

    string += "}\n";
  }

  return string;
};

module.exports = CustomCSS;
