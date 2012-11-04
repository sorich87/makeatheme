var debug
  , app = require("application");

debug = {
  identify: function (user_id) {
    console.log("mixpanel.track");
    console.log(user_id);
  }

  , people: {
    increment: function (properties) {
      console.log("mixpanel.people.increment");
      console.log(properties);
    }
    , set: function (properties) {
      console.log("mixpanel.people.set");
      console.log(properties);
    }
  }

  , track: function (name, properties) {
    console.log("mixpanel.track");
    console.log(name);
    console.log(properties);
  }
};

module.exports = {
  initialize: function () {
    if (app.debug) {
      window.mixpanel = debug;
    }

    if (!("mixpanel" in window)) {
      return;
    }

    // Update user's attributes on login and registration.
    app.on("registration", this.setUserAttributes);
    app.on("login", this.setUserLastLogin);

    // Track click on elements with data-event attribute.
    $("body").on("click", "[data-event]", this.trackClickEvent.bind(this));

    // Track some routes.
    Backbone.history.on("route", this.trackRouteChange.bind(this));
  }

  , setUserAttributes: function (user) {
    mixpanel.people.set({
        $created: new Date(user.get("created_at"))
      , $email: user.get("email")
      , $first_name: user.get("first_name")
      , $last_name: user.get("last_name")
    });
    mixpanel.identify(user.id);

    mixpanel.track("Registration");
  }

  , setUserLastLogin: function (user) {
    mixpanel.people.set({$last_login: new Date()});
    mixpanel.identify(user.id);

    mixpanel.track("Login");
  }

  // data-event attribute should be in the format
  // "eventName:[propertyKey:propertyValue]*"
  , trackClickEvent: function (e) {
    var double
      , properties = {}
      , details = e.currentTarget.getAttribute("data-event").split(":")
      , name = details.splice(0, 1)[0]
      , methodName = "trackUser" + name.replace(/\s/g,"");

    while (details.length > 0) {
      double = details.splice(0, 2);
      properties[double[0]] = double[1];
    }

    mixpanel.track(name, properties);

    // Update user's attributes in relevant cases as well.
    if (this[methodName] !== void 0) {
      this[methodName](properties);
    }
  }

  , trackUserDownload: function (properties) {
    mixpanel.people.increment(properties.format + " downloads");
  }

  , trackUserNewTheme: function (properties) {
    mixpanel.people.increment("themes " + properties.type);
  }

  , trackRouteChange: function (router, name) {
    switch (name) {
      case "index":
        mixpanel.track("Home Page Visit");
        break;

      case "register":
        mixpanel.track("Registration Form Loaded");
        break;
    }
  }
};
