// Extend Backbone.History by adding methods to browse through the history
// Mirrors the window.History API

(function (_, Backbone) {
  var browser = {
    session: []
  };

  Backbone.history || (Backbone.history = new Backbone.History);

  Backbone.history.on("route", function () {
    browser.session[browser.session.length] = Backbone.history.fragment || "/";
  });

  _.extend(Backbone.History.prototype, {
    back: function (args) {
      return this.go(-1, args);
    }

    , go: function (index, args) {
      index = browser.session.length + index - 1;

      if (browser.session[index]) {
        Backbone.history.navigate(browser.session[index], args);
        return true;
      }
    }
  });
})(_, Backbone);
