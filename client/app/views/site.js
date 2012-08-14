var View = require("views/base/view");

// Replace Handlebars tags by site details and blocks
module.exports = View.extend({
  el: $("body")

  , render: function () {
    var replacements, requests, template
      , el = this.el;

    // Site details replacements
    replacements = {
        site_title: this.model.get("title")
      , site_description: this.model.get("description")
      , home_url: this.model.get("home_url")
      , site_url: this.model.get("site_url")
    };

    // Regions replacements
    requests = _.map(this.options.regions, function (region) {
      var type = region.get("type");

      return $.get("/editor/" + type + ".html", function (html) {
        replacements[type] = html;
      });
    });

    // Blocks replacements
    _.each(this.options.blocks, function (block) {
      var id = block.get("id")
        , block_template = require("views/templates/blocks/" + block.get("filename"));

      replacements[id] = block_template(replacements);
    });

    // Wait for AJAX requests to complete
    // And perform a double replacement because regions contain tags
    $.when.apply($, requests).done(function (e) {
      template = Handlebars.compile(el.outerHTML)
      template = template(replacements);
      template = Handlebars.compile(template);
      el.outerHTML = template(replacements);
    });

    return this;
  }
});
