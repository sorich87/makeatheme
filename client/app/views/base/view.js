var app = require("application");

require("lib/view_helpers");

module.exports = Backbone.View.extend({
  // Call on for each model, collection and app event, instantiate the
  // subViews array and bind validation events.
  initialize: function (options) {
    this.subViews = [];

    for (var object in this.objectEvents) {
      if (!this.objectEvents.hasOwnProperty(object)) {
        return;
      }

      this._listenTo(object, this.objectEvents[object]);
    }

    if (this.validateModel) {
      Backbone.Validation.bind(this);
    }

    this._listenTo(app, this.appEvents);
  },

  // Teardown all the subviews, unbind validation events,
  // remove the view element and undelegate its events.
  teardown: function () {
    this.subViews.forEach(function (subView) {
      subView.teardown();
    });

    if (this.validateModel) {
      Backbone.Validation.unbind(this);
    }

    this.remove();
    this.undelegateEvents();

    return this;
  },

  render: function () {
    var data;

    if (this.template) {
      data = _.isFunction(this.data) ? this.data() : this.data;

      this.$el.empty().append(require("views/templates/" + this.template)(data));
    }

    return this;
  },

  _listenTo: function (object, events) {
    if (object !== Object(object)) {
      object = this[object];
    }

    for (var event in events) {
      var callback = events[event];

      this.listenTo(object, event, this[callback]);
    }
  }
});
