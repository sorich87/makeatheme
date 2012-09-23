(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"application": function(exports, require, module) {
  // Application bootstrapper.

  Application = window.Application || {};

  _.extend(Application, {
    initialize: function() {
      var Router = require("router")
        , User = require("models/user")
        , Templates = require("collections/templates")
        , Regions = require("collections/regions")
        , Blocks = require("collections/blocks");

      // Setup notifications handling
      // Append to top window in case document is in an iframe
      this.createView("notifications").render()
        .$el.appendTo($("body", window.top.document));

      // Initialize current user model instance
      this.currentUser = new User(this.data.currentUser);

      // Initialize router
      this.router = new Router();

      // Render the login and logout links
      this.reuseView("auth_links").render();

      // Set per-view body classes
      this.setBodyClasses();

      // Prevent further modification of the application object
      Object.freeze(this);
    }

    // Create a new view, cleanup if the view previously existed
    , createView: function (name, options) {
      var views = this.views || {}
        , View = require("views/" + name);

      if (views[name] !== void 0) {
        views[name].undelegateEvents();
        views[name].remove();
        views[name].off();
      }

      views[name] = new View(options);
      this.views = views;
      return views[name];
    }

    // Return existing view, otherwise create a new one
    , reuseView: function(name, options) {
      var views = this.views || {}
        , View = require("views/" + name);

      if (views[name] !== void 0) {
        return views[name];
      }

      views[name] = new View(options);
      this.views = views;
      return views[name];
    }

    , setBodyClasses: function () {
      Backbone.history.on("route", function (router, name) {
        $("body")[0].className = name;
      });
    }
  }, Backbone.Events);

  module.exports = Application;
  
}});

window.require.define({"collections/base/collection": function(exports, require, module) {
  // Base class for all collections.
  module.exports = Backbone.Collection.extend({
    
  });
  
}});

window.require.define({"collections/blocks": function(exports, require, module) {
  // Blocks collection class.
  var Collection = require("collections/base/collection")
    , Block = require("models/block");

  module.exports = Collection.extend({
    model: Block
  });
  
}});

window.require.define({"collections/regions": function(exports, require, module) {
  // Regions collection class.
  var Collection = require("collections/base/collection")
    , Region = require("models/region");

  module.exports = Collection.extend({
      model: Region

    // Get region by name. Use "default" if slug not specified.
    , getByName: function (name, slug) {
      if (slug === void 0) {
        slug = "default";
      }

      return this.find(function (region) {
        return region.get("slug") === slug && region.get("name") === name;
      });
    }
  });
  
}});

window.require.define({"collections/themes": function(exports, require, module) {
  // Themes collection class.
  var Collection = require("collections/base/collection")
    , Theme = require("models/theme");

  module.exports = Collection.extend({
      model: Theme
    , url: "/themes"
  });
  
}});

window.require.define({"initialize": function(exports, require, module) {
  var application = require('application');

  $(function() {
    application.initialize();

    // Enable HTML5 pushstate
    Backbone.history.start({pushState: true});

    jQuery(function ($) {

      // When a modal is closed, go back to the previous page
      // or go to the homepage if no previous page (#main is empty)
      $(document).on("hidden", ".modal", function () {
        if ($("#main").children().length === 0) {
          Backbone.history.navigate("/", true);
        } else {
          Backbone.history.back(true);
        }
      });

      // All navigation that is relative should be passed through the navigate
      // method, to be processed by the router.
      // If the link has a `data-bypass` attribute, bypass the delegation completely.
      // If the link has a `data-replace` attribute, update the URL without creating
      // an entry in the browser history.
      $(document).on("click", "a:not([data-bypass])", function(e) {
        var href = { prop: $(this).prop("href"), attr: $(this).attr("href") }
          , root = location.protocol + "//" + location.host + "/";

        if (href.prop && href.prop.slice(0, root.length) === root) {
          e.preventDefault();

          Backbone.history.navigate(href.attr, {
            trigger: true,
            replace: !!$(this).data("replace")
          });
        }
      });
    });
  });
  
}});

window.require.define({"lib/html_tags": function(exports, require, module) {
  module.exports = [
    {
        group: "Headings"
      , tags: [
        {
            tag: "h1"
          , label: "Headings 1"
        }
        , {
            tag: "h2"
          , label: "Headings 2"
        }
        , {
            tag: "h3"
          , label: "Headings 3"
        }
        , {
            tag: "h4"
          , label: "Headings 4"
        }
        , {
            tag: "h5"
          , label: "Headings 5"
        }
        , {
            tag: "h6"
          , label: "Headings 6"
        }
      ]
    }
    , {
        group: "Content sections"
      , tags: [
        {
            tag: "p"
          , label: "Paragraphs"
        }
        , {
            tag: "blockquote"
          , label: "Block quotations"
        }
        , {
            tag: "pre"
          , label: "Pre-formatted content"
        }
        , {
            tag: "address"
          , label: "Addresses"
        }
        , {
            tag: "ins"
          , label: "Inserted content"
        }
        , {
            tag: "del"
          , label: "Deleted content"
        }
        , {
            tag: "hr"
          , label: "Horizontal rules"
        }
      ]
    }
    , {
        group: "Inline elements"
      , tags: [
        {
            tag: "a"
          , label: "Links"
        }
        , {
            tag: "abbr"
          , label: "Abbreviations"
        }
        , {
            tag: "acronym"
          , label: "Acronyms"
        }
        , {
            tag: "dfn"
          , label: "Inline definitions"
        }
        , {
            tag: "em"
          , label: "Emphases"
        }
        , {
            tag: "strong"
          , label: "Strong emphases"
        }
        , {
            tag: "cite"
          , label: "Citations"
        }
        , {
            tag: "q"
          , label: "Inline quotations"
        }
        , {
            tag: "sub"
          , label: "Subscripts"
        }
        , {
            tag: "sup"
          , label: "Superscripts"
        }
      ]
    }
    , {
        group: "Lists"
      , tags: [
        {
            tag: "dl"
          , label: "Definition Lists"
        }
        , {
            tag: "dt"
          , label: "Definition Terms"
        }
        , {
            tag: "dd"
          , label: "Definitions"
        }
        , {
            tag: "ol"
          , label: "Ordered Lists"
        }
        , {
            tag: "ul"
          , label: "Unordered Lists"
        }
        , {
            tag: "menu"
          , label: "Menu Lists"
        }
        , {
            tag: "li"
          , label: "List Items"
        }
      ]
    }
    , {
        group: "Forms"
      , tags: [
        {
            tag: "form"
          , label: "Forms"
        }
        , {
            tag: "fieldset"
          , label: "Fieldsets"
        }
        , {
            tag: "legend"
          , label: "Fieldset legends"
        }
        , {
            tag: "input[type=checkbox]"
          , label: "Checkboxes"
        }
        , {
            tag: "input[type=radio]"
          , label: "Radio buttons"
        }
        , {
            tag: "button"
          , label: "Buttons"
        }
        , {
            tag: "input[type=button]"
          , label: "Buttons"
        }
        , {
            tag: "input[type=submit]"
          , label: "Submit buttons"
        }
        , {
            tag: "input[type=image]"
          , label: "Image buttons"
        }
        , {
            tag: "input[type=reset]"
          , label: "Reset buttons"
        }
        , {
            tag: "input[type=text]"
          , label: "Text fields"
        }
        , {
            tag: "input[type=text]"
          , label: "Text fields"
        }
        , {
            tag: "input[type=password]"
          , label: "Password fields"
        }
        , {
            tag: "input[type=file]"
          , label: "File fields"
        }
        , {
            tag: "select"
          , label: "Selection lists"
        }
        , {
            tag: "optgroup"
          , label: "Group of options"
        }
        , {
            tag: "option"
          , label: "Options"
        }
        , {
            tag: "textarea"
          , label: "Multi-line text areas"
        }
      ]
    }
    , {
        group: "Tables"
      , tags: [
        {
            tag: "table"
          , label: "Tables"
        }
        , {
            tag: "caption"
          , label: "Table captions"
        }
        , {
            tag: "thead"
          , label: "Table headers"
        }
        , {
            tag: "tbody"
          , label: "Table bodies"
        }
        , {
            tag: "tfoot"
          , label: "Table footers"
        }
        , {
            tag: "tr"
          , label: "Table rows"
        }
        , {
            tag: "th"
          , label: "Table header cells"
        }
        , {
            tag: "td"
          , label: "Table data cells"
        }
        , {
            tag: "colgroup"
          , label: "Table column groups"
        }
        , {
            tag: "col"
          , label: "Table columns"
        }
      ]
    }
    , {
        group: "Media"
      , tags: [
        {
            tag: "img"
          , label: "Images"
        }
        , {
            tag: "map"
          , label: "Maps"
        }
        , {
            tag: "area"
          , label: "Map areas"
        }
        , {
            tag: "object"
          , label: "Media object"
        }
        , {
            tag: "embed"
          , label: "Media embed"
        }
        , {
            tag: "iframe"
          , label: "Iframes"
        }
      ]
    }
    , {
        group: "Computer text"
      , tags: [
        {
            tag: "code"
          , label: "Source code"
        }
        , {
            tag: "var"
          , label: "Source code variables"
        }
        , {
            tag: "kbd"
          , label: "User input"
        }
        , {
            tag: "samp"
          , label: "Program output"
        }
      ]
    }
    , {
        group: "Presentation"
      , tags: [
        {
            tag: "b"
          , label: "b"
        }
        , {
            tag: "i"
          , label: "i"
        }
        , {
            tag: "u"
          , label: "u"
        }
        , {
            tag: "s"
          , label: "s"
        }
        , {
            tag: "small"
          , label: "small"
        }
        , {
            tag: "big"
          , label: "big"
        }
        , {
            tag: "tt"
          , label: "tt"
        }
      ]
    }
  ];
  
}});

window.require.define({"models/base/model": function(exports, require, module) {
  // Base class for all models.
  module.exports = Backbone.Model.extend({
  });
  
}});

window.require.define({"models/block": function(exports, require, module) {
  // Block model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
    defaults: {
        name: ""
      , template: ""
      , build: ""
    }

    , label: function () {
      return _.str.humanize(this.get("name"));
    }

    , className: function () {
      return this.get("name").replace("_", "-");
    }

    // Return block Handlebars tag
    , tag: function () {
      return "{{ " + this.get("name") + " }}";
    }
  });
  
}});

window.require.define({"models/region": function(exports, require, module) {
  // Region model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
    defaults: {
        slug: ""
      , name: ""
      , template: ""
    }

    , validate: function (attrs) {
      if (["header", "footer"].indexOf(attrs.name) < 0) {
        return "Region must be header or footer.";
      }
    }
  });
  
}});

window.require.define({"models/theme": function(exports, require, module) {
  // Theme model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
      idAttribute: "_id"
    , urlRoot: "/themes"

    , defaults: {
        name: ""
      , author: ""
      , screenshot_uri: ""
    }
  });
  
}});

window.require.define({"models/user": function(exports, require, module) {
  // User model class.
  var Model = require("models/base/model")
    , Themes = require("collections/themes");

  module.exports = Model.extend({
      defaults: {
        first_name: ""
      , last_name: ""
      , email: ""
      , password: ""
      , password_confirmation: ""
      , themes: []
    }

    , initialize: function() {
      var collection = new Themes(this.attributes.themes);
    }

    , url: "/users"

    , validation: {
      first_name: {
        required: true
      }
      , last_name: {
        required: true
      }
      , email: {
          required: true
        , pattern: "email"
      }
      , password: {
        required: function (value, attr, computed) {
          if (computed && !computed.id) {
            return true;
          }
          return false;
        }
      }
      , password_confirmation: {
        equalTo: "password"
      }
    }
  });
  
}});

window.require.define({"views/auth_links": function(exports, require, module) {
  // Display the login and register links
  var View = require("views/base/view")
    , template = require("views/templates/auth_links")
    , app = require("application");

  module.exports = View.extend({
      el: $("#auth-links")
    , model: app.currentUser

    , events: {
      "click #logout": "deleteSession"
    }

    , initialize: function () {
      this.model.on("change", this.render, this);
    }

    , render: function () {
      var links = template({currentUser: this.model.toJSON()});

      this.$el.empty().append(links);

      return this;
    }

    // Send request to delete current user session
    // and redirect to homepage on success
    , deleteSession: function () {
      $.ajax({
          contentType: "application/json; charset=UTF-8"
        , dataType: "json"
        , type: "DELETE"
        , url: "/session"
        , complete: function (jqXHR, textStatus) {
          if (textStatus === "success") {
            window.location = "/";
          }
        }.bind(this)
      });
    }
  });
  
}});

window.require.define({"views/base/view": function(exports, require, module) {
  // Base class for all views.
  module.exports = Backbone.View.extend({
    render: function () {
      // If template attribute is set, render the template
      if (this.template) {
        this.$el.empty().append(require("views/templates/" + this.template)(this.data));
      }

      return this;
    }
  });
  
}});

window.require.define({"views/faq": function(exports, require, module) {
  var View = require("views/base/view");

  module.exports = View.extend({
      className: "well"
    , template: "faq"
  });
  
}});

window.require.define({"views/login": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      className: "modal"
    , template: "login"
    , model: app.currentUser

    , events: {
      "submit form": "loginUser"
    }

    , loginUser: function (e) {
      e.preventDefault();

      if (this.validateInputs()) {
        this.submitData();
      }
    }

    , validateInputs: function () {
      var valid = true;

      this.$("input").each(function (i, element) {
        var attr = element.getAttribute("name");

        if (element.value === "") {
          var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " can't be blank";
          Backbone.Validation.callbacks.invalid(this, attr, msg, "name");

          valid = false;
        }
      }.bind(this));

      return valid;
    }

    , submitData: function () {
      var data = {};

      this.$("input").each(function (i, element) {
        var attr = element.getAttribute("name");

        data[attr] = element.value;
      });

      $.ajax({
          contentType: "application/json;charset=UTF-8"
        , dataType: "json"
        , type: "POST"
        , url: "/session"
        , data: JSON.stringify(data)
        , complete: function (jqXHR, textStatus) {
          var response = JSON.parse(jqXHR.responseText);

          switch (textStatus) {
            case "success":
              this.model.set(response);

              this.$el.modal("hide");

              app.trigger("notification", "success", "Welcome back, " + this.model.get("first_name") + ".");
            break;

            case "error":
              var form = this.$("form");

              if (form.children(".alert-error").length === 0) {
                form.prepend("<p class='alert alert-error'>" + response.error + "</p>");
              }
            break;
          }
        }.bind(this)
      });
    }
  });
  
}});

window.require.define({"views/not_found": function(exports, require, module) {
  var View = require("views/base/view");

  module.exports = View.extend({
      id: "not-found"
    , template: "not_found"
  });
  
}});

window.require.define({"views/notifications": function(exports, require, module) {
  // Notifications view
  // Show all notifications in an ul
  // Listen to notification events to render a notification and append it to the ul
  // Hide the notification after 4s
  var app = require("application")
    , View = require("views/base/view")
    , template = require("views/templates/notification");

  module.exports = View.extend({
      tagName: "ul"
    , id: "notifications"
    , className: "unstyled"

    , initialize: function () {
      _.bindAll(this, "showNotification", "handleServerNotifications");

      app.on("notification", this.showNotification);

      (new EventSource("/notifications")).onmessage = this.handleServerNotifications;
    }

    , showNotification: function (type, text) {
      var $li = $(template({type: type, text: text})).appendTo(this.$el);

      setTimeout(function () {
        $li.alert("close");
      }, 4000);

      return this;
    }

    , handleServerNotifications: function (e) {
      var data = JSON.parse(e.data);
      this.showNotification(data.type, data.text);
    }
  });
  
}});

window.require.define({"views/password_reset": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      className: "modal"
    , template: "password_reset"
    , model: app.currentUser

    , events: {
      "submit form": "initiatePasswordReset"
    }

    , initiatePasswordReset: function (e) {
      e.preventDefault();

      if (this.validateInputs()) {
        this.initiateReset();
      }
    }

    , validateInputs: function () {
      var valid = true;

      this.$("form input").each(function (i, element) {
        var attr = element.getAttribute("name");

        if (element.value === "") {
          var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " can't be blank";
          Backbone.Validation.callbacks.invalid(this, attr, msg, "name");

          valid = false;
        }
      }.bind(this));

      return valid;
    }

    , initiateReset: function () {
      var data = {
          email: this.$("input[name=email]")[0].value
        , password: this.$("input[name=password]")[0].value
      };

      $.ajax({
          contentType: "application/json;charset=UTF-8"
        , dataType: "json"
        , type: "POST"
        , url: "/users/reset_password"
        , data: JSON.stringify(data)
        , complete: function (jqXHR, textStatus) {
          switch (textStatus) {
            case "success":
              this.$el.modal("hide");

              app.trigger("notification", "success", "We have sent you an email with a link to confirm your new password.");
            break;

            case "error":
            break;
          }
        }.bind(this)
      });
    }
  });
  
}});

window.require.define({"views/regions": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/regions")
    , app = require("application")
    , Region = require("models/region")
    , Regions = require("collections/regions");

  module.exports = View.extend({
      id: "x-region-select"
    , className: "x-section"
    , collection: new Regions(app.data.theme_pieces.regions)

    , events: {
        "change .x-header-select, .x-footer-select": "switchRegion"
      , "click .x-header-new button, .x-footer-new button": "addRegion"
    }

    , initialize: function () {
      _.bindAll(this, "buildDownload", "makeMutable", "addRegionsToTemplate");

      this.collection.on("add", this.addOne, this);

      app.on("download:before", this.buildDownload);
      app.on("mutations:started", this.makeMutable);
      app.on("template:load", this.addRegionsToTemplate);
    }

    , render: function () {
      this.$el.empty().append(template({
          headers: this.collection.where({name: "header"}).map(function (header) { return header.attributes; })
        , footers: this.collection.where({name: "footer"}).map(function (footer) { return footer.attributes; })
      }));

      this.$(".x-header-new, .x-footer-new").hide();

      return this;
    }

    , switchRegion: function (e) {
      var name, slug, region;

      if (e.target.className.indexOf("header") != -1) {
        name = "header";
      } else {
        name = "footer";
      }

      slug = $(e.target).val();

      this.toggleForm(name, slug);

      if (slug) {
        this.loadRegion(this.collection.getByName(name, slug));
      }
    }

    , toggleForm: function (name, slug) {
      if (slug) {
        this.$(".x-" + name + "-new").hide("slow");
      } else {
        this.$(".x-" + name + "-new").show("slow");
      }
    }

    , loadRegion: function (region) {
      var name = region.get("name");

      app.trigger("region:load", region);

      $("#page").children(name)[0].outerHTML = region.get("build");
      $("#page").children(name).fadeOut().fadeIn();

      app.trigger("region:loaded", region);
    }

    , addRegion: function (e) {
      var name, slug, region, $element;

      if (e.currentTarget.className.indexOf("header") != -1) {
        name = "header";
      } else {
        name = "footer";
      }

      slug = _.str.slugify(this.$(".x-" + name + "-new input").val());

      if (!slug) {
        app.trigger("notification", "error", "Please, enter a " + name + " name.");
        return;
      }

      attributes = _.pick(this.collection.getByName(name).attributes, "name", "template", "build");
      attributes.slug = slug;

      region = new Region(attributes);
      this.collection.add(region);
      this.loadRegion(region);

      $(e.currentTarget).parent().hide("slow");

      app.trigger("notification", "success", "The new " + name + " was created. It's a copy of the default one.");
    }

    , addOne: function (region) {
      var slug;

      slug = region.get("slug");

      this.$(".x-" + region.get("name") + "-select")
        .children(":selected").removeAttr("selected").end()
        .children("[value='']")
          .before("<option value='" + slug + "' selected='selected'>" + slug + "</option>");
    }

    , buildDownload: function (attributes) {
      attributes.regions = _.map(this.collection.models, function (region) {
        return _.pick(region.attributes, "_id", "name", "slug", "template");
      });
    }

    , makeMutable: function (pieces) {
      pieces.regions = this.collection;
    }

    , addRegionsToTemplate: function (template) {
      var regions = template.get("regions");

      template.set("regions_attributes", {
          header: this.collection.getByName("header", regions.header)
        , footer: this.collection.getByName("footer", regions.footer)
      });
    }
  });
  
}});

window.require.define({"views/register": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      className: "modal"
    , template: "register"
    , model: app.currentUser

    , events: {
      "submit form": "createUser"
    }

    , initialize: function () {
      Backbone.Validation.bind(this);
    }

    // Create current user from form input values and submit to the server.
    // Handle error messages from server.
    // Hide modal on success.
    , createUser: function (e) {
      e.preventDefault();

      var user = this.model
        , attrs = {};

      this.$("input").each(function () {
        attrs[this.getAttribute("name")] = this.value;
      });

      user.save(attrs, {
        success: function (model, res) {
          model.set(res);

          app.trigger("notification", "success", "Your registration was successful. You are now logged in.");

          this.$el.modal("hide");
        }.bind(this)

        , error: function (model, err) {
          this.displayServerErrors(err);
        }.bind(this)
      });
    }

    , displayServerErrors: function (err) {
      if (! err.responseText) {
        return;
      }

      var msgs = JSON.parse(err.responseText);

      Object.keys(msgs).forEach(function (attr) {
        var msg = Backbone.Validation.labelFormatters.sentenceCase(attr) + " " + msgs[attr][0];
        Backbone.Validation.callbacks.invalid(this, attr, msg, "name");
      }.bind(this));
    }
  });
  
}});

window.require.define({"views/share_link": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      id: "x-share-link"
    , className: "x-section"
    , template: "share_link"
    , data: {
      theme: app.data.theme._id
    }
  });
  
}});

window.require.define({"views/templates/auth_links": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this;

  function program1(depth0,data) {
    
    
    return "\n  <ul class=\"nav\">\n    <li><a href=\"/me/themes\" id=\"your_themes\">Your themes</a></li>\n    <li><a href=\"/upload\" id=\"upload_theme\">Upload</a></li>\n  </ul>\n  <button class=\"btn\" id=\"logout\">Log out</button>\n";}

  function program3(depth0,data) {
    
    
    return "\n  <ul class=\"nav\">\n    <li><a id=\"register\" href=\"/register\">Register</a></li>\n    <li><a id=\"login\" href=\"/login\">Log in</a></li>\n  </ul>\n";}

    foundHelper = helpers.currentUser;
    stack1 = foundHelper || depth0.currentUser;
    stack1 = (stack1 === null || stack1 === undefined || stack1 === false ? stack1 : stack1.id);
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(3, program3, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n";
    return buffer;});
}});

window.require.define({"views/templates/faq": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"page-header\">\n  <h1>\n    Online Theme Editor\n    <small>exports to HTML5 and WordPress themes</small>\n  </h1>\n</div>\n<p class=\"lead\">The future of website design is here, now, in your browser.\n<a href=\"/register\" class=\"btn btn-large btn-primary\">Get Started</a></p>\n<p>The easiest to use online theme editor that churns out beautiful, standard compliant, responsive,<br />\nSEO-friendly, [ insert any buzzword here ;) ]  HTML5 and WordPress themes in minutes.</p>\n<p>Start by choosing a preset theme below.\n(<a data-toggle=\"collapse\" data-bypass=\"true\" href=\"#faq\">FAQ</a>)</p>\n\n<div id=\"faq\" class=\"collapse\">\n  <h3>Frequently Asked Questions</h3>\n  <h4>How it works?</h4>\n  <ul>\n    <li>Scroll down the page to see the full list of all the themes and choose the one you like.</li>\n    <li>When you find the theme you want, click the \"Customize\" button and you will be taken\n    to the customizer where you can make edits until you are satisfied.</li>\n    <li>Then, click on \"Download\" to download the WordPress theme with your customizations included.</li>\n  </ul>\n  <h4>Something doesn't work. What should I do?</h4>\n  <p>It is our fault and we are sorry for that. This site is a work in progress and\n  we are building new features and fixing bugs every day. Please contact us if something doesn't work for you\n  and we will quickly find a solution.</p>\n\n  <p><a data-toggle=\"collapse\" data-bypass=\"true\" href=\"#faq\"><i class=\"icon-arrow-up\"></i> Hide</a></p>\n</div>\n";});
}});

window.require.define({"views/templates/login": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Please authenticate yourself</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"email\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" name=\"password\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Log In</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Forgot your password? <a href=\"/reset_password\" data-dismiss=\"modal\">Reset password</a></li>\n    <li>Don't have an account yet? <a href=\"/register\" data-dismiss=\"modal\">Register</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/not_found": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<h1 class=\"page-header\">Ooops! We screwed up. :(</h1>\n<p class=\"lead\">Sorry, the page you were looking for doesn’t exist.</p>\n<p>Go back to <a href=\"/\" title=\"thememy.com\">homepage</a> or contact us about a problem.</p>\n";});
}});

window.require.define({"views/templates/notification": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<li class=\"alert alert-";
    foundHelper = helpers.type;
    stack1 = foundHelper || depth0.type;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "type", { hash: {} }); }
    buffer += escapeExpression(stack1) + " fade in\"><button class=\"close\" data-dismiss=\"alert\">×</button> ";
    foundHelper = helpers.text;
    stack1 = foundHelper || depth0.text;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</li>\n";
    return buffer;});
}});

window.require.define({"views/templates/password_reset": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Reset password</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\" id=\"password_reset\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"email\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"password\">New Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" name=\"password\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Send reset email</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Remember your password? <a href=\"/login\" data-dismiss=\"modal\">Log in</a></li>\n    <li>Don't have an account yet? <a href=\"/register\" data-dismiss=\"modal\">Register</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/regions": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  <option value=\"";
    foundHelper = helpers.slug;
    stack1 = foundHelper || depth0.slug;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.slug;
    stack1 = foundHelper || depth0.slug;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n  ";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  <option value=\"";
    foundHelper = helpers.slug;
    stack1 = foundHelper || depth0.slug;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.slug;
    stack1 = foundHelper || depth0.slug;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n  ";
    return buffer;}

    buffer += "<label>Header:</label>\n<select class=\"x-header-select\">\n  ";
    foundHelper = helpers.headers;
    stack1 = foundHelper || depth0.headers;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <option value=\"\">new header</option>\n</select>\n<div class=\"x-header-new\">\n  <input type=\"text\" value=\"\" placeholder=\"Enter header name\" />\n  <button class=\"x-header-add\">Add</button>\n</div>\n\n<label>Footer:</label>\n<select class=\"x-footer-select\">\n  ";
    foundHelper = helpers.footers;
    stack1 = foundHelper || depth0.footers;
    stack2 = helpers.each;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  <option value=\"\">new footer</option>\n</select>\n<div class=\"x-footer-new\">\n  <input type=\"text\" value=\"\" placeholder=\"Enter footer name\" />\n  <button class=\"x-footer-add\">Add</button>\n</div>\n";
    return buffer;});
}});

window.require.define({"views/templates/register": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Create an account</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-first-name\">First Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"first_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-last-name\">Last Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"last_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"email\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"password\" class=\"input-xlarge\" name=\"password\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password-confirmation\">Password Confirmation</label>\n        <div class=\"controls\">\n          <input type=\"password\" class=\"input-xlarge\" name=\"password_confirmation\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary submit\">Register</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Already have an account? <a href=\"/login\" data-dismiss=\"modal\">Log in</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/share_link": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<p>http://thememy.com/themes/";
    foundHelper = helpers.theme;
    stack1 = foundHelper || depth0.theme;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "theme", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</p>\n";
    return buffer;});
}});

window.require.define({"views/templates/style_edit": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n    <option value=\"";
    foundHelper = helpers.value;
    stack1 = foundHelper || depth0.value;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "value", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    foundHelper = helpers.selected;
    stack1 = foundHelper || depth0.selected;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selected", { hash: {} }); }
    buffer += escapeExpression(stack1) + ">";
    foundHelper = helpers.label;
    stack1 = foundHelper || depth0.label;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n    ";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n    <optgroup label=\"";
    foundHelper = helpers.group;
    stack1 = foundHelper || depth0.group;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "group", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n      ";
    foundHelper = helpers.tags;
    stack1 = foundHelper || depth0.tags;
    stack2 = helpers.each;
    tmp1 = self.program(4, program4, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n    </optgroup>\n    ";
    return buffer;}
  function program4(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n      <option value=\"";
    foundHelper = helpers.tag;
    stack1 = foundHelper || depth0.tag;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "tag", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"";
    foundHelper = helpers.selected;
    stack1 = foundHelper || depth0.selected;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selected", { hash: {} }); }
    buffer += escapeExpression(stack1) + ">";
    foundHelper = helpers.label;
    stack1 = foundHelper || depth0.label;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
    buffer += escapeExpression(stack1) + " (";
    foundHelper = helpers.tag;
    stack1 = foundHelper || depth0.tag;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "tag", { hash: {} }); }
    buffer += escapeExpression(stack1) + ")</option>\n      ";
    return buffer;}

  function program6(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n  Selected Element: <b>";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth0.selector;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "selector", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</b>\n  ";
    return buffer;}

  function program8(depth0,data) {
    
    
    return "\n  Click on an element in the design to customize it.\n  ";}

  function program10(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n    <li>\n      <input name=\"property\" value=\"";
    foundHelper = helpers.property;
    stack1 = foundHelper || depth0.property;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "property", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />:\n      <input name=\"value\" value=\"";
    foundHelper = helpers.value;
    stack1 = foundHelper || depth0.value;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "value", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n      <input type=\"hidden\" name=\"index\" value=\"";
    foundHelper = helpers.index;
    stack1 = foundHelper || depth0.index;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "index", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" />\n    </li>\n    ";
    return buffer;}

    buffer += "<form>\n  <select class=\"x-element\">\n    ";
    foundHelper = helpers.elements;
    stack1 = foundHelper || depth0.elements;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </select>\n\n  <select class=\"x-tag\">\n    <option value=\"\">Every Tag</option>\n    ";
    foundHelper = helpers.htmlTags;
    stack1 = foundHelper || depth0.htmlTags;
    stack2 = helpers.each;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </select>\n\n  <p class=\"x-choice\">\n  ";
    foundHelper = helpers.selector;
    stack1 = foundHelper || depth0.selector;
    stack2 = helpers['if'];
    tmp1 = self.program(6, program6, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.program(8, program8, data);
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </p>\n\n  <ul class=\"x-rules\">\n    ";
    foundHelper = helpers.rules;
    stack1 = foundHelper || depth0.rules;
    stack2 = helpers.each;
    tmp1 = self.program(10, program10, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n  </ul>\n  <button>Add custom style</button>\n</form>\n";
    return buffer;});
}});

window.require.define({"views/templates/templates": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\n<button class=\"x-new-template\">&plus; New Template</button>\n<div class=\"x-new-template-select\">\n  <label>Choose:\n    <select>\n      ";
    foundHelper = helpers.standards;
    stack1 = foundHelper || depth0.standards;
    stack2 = helpers.each;
    tmp1 = self.program(2, program2, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n      <option value=\"\">Other</option>\n    </select>\n  </label>\n  <input class=\"x-new-template-name\" type=\"text\" value=\"\" placeholder=\"Enter template name\" />\n  <button class=\"x-new-template-add\">Add</button>\n</div>\n";
    return buffer;}
  function program2(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n      <option value=\"";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    foundHelper = helpers.label;
    stack1 = foundHelper || depth0.label;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</option>\n      ";
    return buffer;}

    buffer += "<p>Click to change</p>\n<ul class=\"x-rects\"></ul>\n";
    foundHelper = helpers.edit;
    stack1 = foundHelper || depth0.edit;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n";
    return buffer;});
}});

window.require.define({"views/templates/theme": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<iframe id=\"theme\" name=\"theme\" src=\"/editor/";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" frameborder=\"0\" width=\"100%\" height=\"100%\"></iframe>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme_list": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<li class=\"span3\">\n  <div class=\"thumbnail\">\n    <a href=\"/themes/";
    foundHelper = helpers._id;
    stack1 = foundHelper || depth0._id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"><img src=\"";
    foundHelper = helpers.screenshot_uri;
    stack1 = foundHelper || depth0.screenshot_uri;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "screenshot_uri", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" alt=\"\"></a>\n    <div class=\"caption\">\n      <h4>";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\n      <p>by <a href=\"#\">";
    foundHelper = helpers.author;
    stack1 = foundHelper || depth0.author;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "author", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</a></p>\n      <div>\n        <a class=\"btn btn-primary pull-right\" href=\"/themes/";
    foundHelper = helpers._id;
    stack1 = foundHelper || depth0._id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\"><i class=\"icon-pencil icon-white\"></i> Customize</a>\n      </div>\n    </div>\n  </div>\n</li>\n";
    return buffer;});
}});

window.require.define({"views/templates/theme_upload": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Upload a new theme</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"file\">Theme Archive</label>\n        <div class=\"controls\">\n          <input type=\"file\" name=\"file\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Upload Theme</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n</div>\n";});
}});

window.require.define({"views/theme": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/theme")
    , application = require("application");

  module.exports = View.extend({
    render: function () {
      this.$el.empty()
        .append(template({id: this.options.themeID}));

      return this;
    }
  });
  
}});

window.require.define({"views/theme_list": function(exports, require, module) {
  var View = require("views/base/view")
    , Themes = require("collections/themes")
    , template = require("views/templates/theme_list")
    , app = require("application");

  module.exports = View.extend({
      el: $("<ul class='thumbnails'></ul>")

    , initialize: function () {
      this.bindEvents();
    }

    , render: function () {
      this.collection.reset(this.collection.models);

      return this;
    }

    , bindEvents: function () {
      this.collection.on("reset", this.addAll, this);
    }

    , addOne: function (theme) {
      this.$el.append(template(theme.toJSON()));
    }

    , addAll: function () {
      this.$el.empty();

      this.collection.each(function (theme) {
        this.addOne(theme);
      }, this);
    }
  });
  
}});

