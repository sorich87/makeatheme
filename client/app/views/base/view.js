// Base class for all views.
module.exports = Backbone.View.extend({
  render: function () {
    // If template attribute is set, render the template
    if (this.template) {
      this.setElement(require("views/templates/" + this.template)());
    }

    return this;
  }
});
