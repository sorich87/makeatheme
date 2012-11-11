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
