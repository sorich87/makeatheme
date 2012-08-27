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
      var defaults = require("lib/defaults")
        , Router = require("lib/router")
        , User = require("models/user");

      // merge data from server with default values
      // get data set in the page, or parent frame if in iframe
      this.data = _.defaults(this.data, defaults);

      // Initialize current user model instance
      this.currentUser = new User(this.data.currentUser);

      // Initialize router
      this.router = new Router();

      // Render the login and logout links
      this.reuseView("auth_links").render();

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
  });
  
}});

window.require.define({"collections/templates": function(exports, require, module) {
  // Templates collection class.
  var Collection = require("collections/base/collection")
    , Template = require("models/template");

  module.exports = Collection.extend({
    model: Template
  });
  
}});

window.require.define({"collections/themes": function(exports, require, module) {
  // Themes collection class.
  var Collection = require("collections/base/collection")
    , Theme = require("models/theme");

  module.exports = Collection.extend({
    model: Theme
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
          history.go(-1);
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

window.require.define({"lib/defaults": function(exports, require, module) {
  module.exports = {
    regions: [
        {
          type: "header"
        , name: "Default Header"
      }
      , {
          type: "footer"
        , name: "Default Footer"
      }
      , {
          type: "content"
        , name: "Default Content"
      }
      , {
          type: "sidebar"
        , name: "Primary Sidebar"
      }
    ]
    , blocks: [
        {
          id: "header_image"
        , name: "Header Image"
        , filename: "headerimage"
      }
      , {
          id: "menu"
        , name: "Menu"
        , filename: "menu"
      }
      , {
          id: "search_form"
        , name: "Search Form"
        , filename: "searchform"
      }
    ]
    , templates: [
        {
          filename: "index"
        , name: "Default"
      }
      , {
          filename: "page"
        , name: "Page"
      }
    ]
  };
  
}});

window.require.define({"lib/router": function(exports, require, module) {
  var app = require("application");

  module.exports = Backbone.Router.extend({
    routes: {
        "": "index"
      , "themes/:id": "theme"
      , "editor/:file": "editor"
      , "login": "login"
      , "register": "register"
      , "upload": "upload"
      , "*actions": "notFound"
    }

    , index: function () {
      $("#main").empty()
        .append(app.reuseView("faq").render().$el)
        .append(app.reuseView("theme_list").render().$el);
    }

    , theme: function (id) {
      var themeView = app.createView("theme", {themeID: id});

      $("#main").empty().append(themeView.render().$el);

      // Add theme class to body
      $("body").addClass("theme");

      // Remove body class when navigating away from this route
      Backbone.history.on("route", function (e, name) {
        if (name !== "theme") {
          $("body").removeClass("theme");
        }
      });
    }

    , editor: function (id) {
      // Setup editor box
      app.createView("editor").render().$el
        .append(app.createView("template_select").render().$el)
        .append(app.createView("block_insert").render().$el)
        .append(app.createView("style_edit").render().$el)
        .append(app.createView("download_button").render().$el)

      // Render page and append editor to it
        .appendTo($("body"));

      // Setup drag and drop and resize
      app.createView("layout").render();
    }

    , login: function () {
      // Remove all modals and show the 'login' one
      // We could use modal("hide") here but it would trigger
      // events which we don't want
      $("body").removeClass("modal-open")
        .find(".modal, .modal-backdrop").remove().end()
        .append(app.reuseView("login").render().$el.modal("show"));
    }

    , register: function () {
      // Remove all modals and show the 'register' one
      // We could use modal("hide") here but it would trigger
      // events which we don't want
      $("body").removeClass("modal-open")
        .find(".modal, .modal-backdrop").remove().end()
        .append(app.reuseView("register").render().$el.modal("show"));
    }

    , upload: function () {
      $("body").removeClass("modal-open")
        .find(".modal, .modal-backdrop").remove().end()
        .append(app.reuseView("theme_upload").render().$el.modal("show"));
    }

    , notFound: function () {
      $("#main").empty()
        .append(app.reuseView("not_found").render().$el);
    }
  });
  
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
      , filename: ""
    }
  });
  
}});

window.require.define({"models/region": function(exports, require, module) {
  // Region model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
    defaults: {
        type: "sidebar"
      , name: ""
      , template: ""
    }

    , validate: function (attrs) {
      if (["header", "footer", "content", "sidebar"].indexOf(attrs.type) < 0) {
        return "Region type must be header, footer, content or sidebar.";
      }
    }
  });
  
}});

window.require.define({"models/template": function(exports, require, module) {
  // Template model class.
  // A template can be one of the following:
  // filename : Name
  // index.html : Default
  // front-page.html : Front Page
  // home.html : Blog
  // single.html : Post
  // page.html : Page
  // archive.html : Archive
  // search.html : Search Result
  // 404.html : Error 404
  var Model = require("models/base/model");

  module.exports = Model.extend({
    defaults: {
        name: ""
      , filename: ""
    }
  });
  
}});

window.require.define({"models/theme": function(exports, require, module) {
  // Theme model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
      idAttribute: "_id"

    , defaults: {
        name: ""
      , author: ""
      , author_uri: ""
    }
  });
  
}});

window.require.define({"models/user": function(exports, require, module) {
  // User model class.
  var Model = require("models/base/model");

  module.exports = Model.extend({
      defaults: {
        first_name: ""
      , last_name: ""
      , email: ""
      , password: ""
      , password_confirmation: ""
    }

    , url: "/user.json"

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
        , type: "DELETE"
        , url: "/session.json"
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
        this.$el.empty().append(require("views/templates/" + this.template)());
      }

      return this;
    }
  });
  
}});

window.require.define({"views/block_insert": function(exports, require, module) {
  // Display list of blocks to insert
  var View = require("views/base/view")
    , Blocks = require("collections/blocks")
    , app = require("application");

  module.exports = View.extend({
      el: $("<div id='x-block-insert'><h4>Blocks</h4>\
            <p>Drag and drop to insert</p><ul></ul></div>")

    , collection: new Blocks(app.data.blocks)

    , initialize: function () {
      this.bindEvents();
    }

    , render: function () {
      this.collection.reset(this.collection.models);

      return this;
    }

    , bindEvents: function () {
      this.collection.on("reset", this.addAll, this);

      $(window.document).on("draginit", "#x-block-insert a", this.draginit);
      $(window.document).on("dragend", "#x-block-insert a", $.proxy(this.dragend, this));
    }

    , addOne: function (block) {
      var name = block.get("name")
      , id = block.get("id");

      this.$("ul").append("<li><a href='#' data-id='" + id + "'>\
                          <span>&Dagger;</span> " + name + "</a></li>");
    }

    , addAll: function () {
      this.$("ul").empty();

      _.each(this.collection.models, function (block) {
        this.addOne(block);
      }, this);
    }

    // Replace the drag element by its clone
    , draginit: function (e, drag) {
      drag.element = drag.ghost();
    }

    // Load the actual template chuck to insert
    , dragend: function (e, drag) {
      var block = this.collection.get(drag.element.data("id"));

      drag.element[0].outerHTML = require("views/templates/blocks/" + block.get("filename"))();
    }
  });
  
}});

window.require.define({"views/download_button": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      id: "x-download-button"

    , render: function () {
      this.$el.html("<button class='x-btn x-btn-success'>Download Theme</button>");

      $(window.document).on("click", "button", this.download);

      return this;
    }

    , download: function () {
      var customization = {
          regions: app.regions.models
        , templates: app.templates.models
      };

      $.ajax({
          url: "/themes/" + window.parent.themeID + "/customize.json"
        , type: "POST"
        , contentType: "application/json; charset=utf-8"
        , data: JSON.stringify(customization)
        , success: function(data) {
            var el = '<iframe src="data:application.zip/octet-stream;base64,'+data+'"></iframe>.';
            $('body').append($(el));
        }
      });
    }
  });
  
}});

window.require.define({"views/editor": function(exports, require, module) {
  var app = require("application")
    , View = require("views/base/view");

  module.exports = View.extend({
    el: $("<div id='x-layout-editor'>\
        <div class='x-handle'>&Dagger;</div>\
        </div>")

    , initialize: function () {
      $(window.document).on({
        draginit: function (e, drag) {
          var mouse = drag.mouseElementPosition;

          drag.representative($(drag.element).parent(), mouse.left(), mouse.top()).only();
        }

        , dragmove: function (e, drag) {
          $(drag.element).parent().css("zIndex", 9999);
        }
      }, "#x-layout-editor .x-handle");
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

window.require.define({"views/layout": function(exports, require, module) {
  var totalColumnsWidth, isRowFull
    , View = require("views/base/view");

  // Return total width of all columns children of a row
  // except the one being dragged
  totalColumnsWidth = function (dropElement, dragElement) {
    return _.reduce($(dropElement).children(), function (memo, child) {
      if ($(child).is(dragElement)) {
        return memo;
      } else {
        return memo + $(child).outerWidth(true);
      }
    }, 0);

  };

  // Does total width of all columns children of a drop row
  // allow a new column?
  isRowFull = function (dropElement, dragElement) {
    var rowWidth = $(dropElement).width();

    return rowWidth <= totalColumnsWidth(dropElement, dragElement);
  };


  module.exports = View.extend({
      el: $(window.document)

    , currentAction: null

    , render: function () {
      this.highlightColumns();
      this.setupDrag();
      this.setupDrop();
      this.setupResize();
      this.setupRemove();
    }

    , highlightColumns: function () {
      this.$el.on("hover", ".columns", $.proxy(function (e) {
        if (this.currentAction !== null) {
          return;
        }

        var $column = $(e.currentTarget);

        $(".columns.x-current").removeClass("x-current");
        $column.addClass("x-current")

        if ($column.children(".x-resize").length === 0) {
          $column.html(function (i, html) {
            return html + "<div class='x-resize' title='Resize element'>&harr;</div>";
          });
        }

        if ($column.children(".x-remove").length === 0) {
          $column.html(function (i, html) {
            return html + "<div class='x-remove' title='Remove element'>&times;</div>";
          });
        }

      }, this));
    }

    , setupDrag: function () {
      var preventDefault;

      preventDefault = function (e) {
        if (!this.isContentEditable) {
          e.preventDefault();
        }
      };

      // Links in draggable areas shouldn't be clickable
      this.$el.on("click", ".columns a", preventDefault);

      // Links and images in draggable areas shoulnd't be draggable
      this.$el.on("mousedown", ".columns a, .columns img", preventDefault);

      this.$el.on({
        draginit: $.proxy(function (e, drag) {
          this.currentAction = "drag";

          var $dragElement = $(drag.element);

          // Limit drag to first container
          drag.limit($("body").children()).revert();
        }, this)

        , dragdown: function (e, drag) {
        }

        , dragend: $.proxy(function (e, drag) {
          // Reset position
          $(drag.element).css({
            top: drag.startPosition.top() + "px",
            left: drag.startPosition.left() + "px"
          });

          this.currentAction = null;
        }, this)
      }, ".columns");
    }

    , setupDrop: function () {
      this.$el.on({
        dropover: function (e, drop, drag) {
          // Mark the row as full or not
          if (isRowFull(this, drag.element)) {
            $(this).addClass("x-full");
          } else {
            $(this).addClass("x-not-full");
          }
        }

        , dropout: function (e, drop, drag) {
          // Remove x-full or x-not-full class if previously added
          $(this).removeClass("x-full x-not-full");
        }

        , dropon: function (e, drop, drag) {
          var row, $drag, $dragParent, $dragGrandParent;

          $drag = $(drag.element);

          // Save original parent
          $dragParent = $drag.parent();

          // Add column to row. If the row is full, add to a new one
          if (isRowFull(this, $drag)) {
            row = $("<div class='row'></div>").insertAfter(this);
          } else {
            row = this;
          }
          $drag.appendTo(row);

          $(this).removeClass("x-empty");

          // If original parent doesn't have any more children
          // and is not a <header> or <footer> and has no id attribute, remove it
          if ($dragParent.children().length === 0 ) {
            $dragGrandParent = $dragParent.parent();

            if (($dragGrandParent.is("header, footer") && $dragGrandParent.children().length === 1)
                || $dragParent.attr("id") !== undefined) {
              $dragParent.addClass("x-empty");
            } else {
              $dragParent.remove();
            }
          }

          // Remove x-full and x-not-full classes if one was previously added
          $(this).removeClass("x-full x-not-full");
        }
      }, ".row");
    }

    , setupResize: function () {
      this.$el.on({
        draginit: $.proxy(function (e, drag) {
          this.currentAction = "resize";

          var $dragElement = $(drag.element);

          // Resize is done horizontally and doesn't notify drops
          drag.horizontal().only();
        }, this)

        , dragmove: function (e, drag) {
          var $column = $(this).parent()
            , $row = $column.parent()
            , $drag = $(drag.element);

          width = drag.location.x() + $drag.width() / 2 - $column.offset().left;

          // Sum of column widths should never be larger than row
          if (width >= $row.width()) {
            width = $row.width();
            e.preventDefault();
          } else if (width >= $row.width() - totalColumnsWidth($row, $column)) {
            width = $row.width() - totalColumnsWidth($row, $column);
            // When width is a float, calculation is incorrect because browsers use integers
            // The following line fixes that. Replace as soon as you find a cleaner solution
            width = width - 1
            e.preventDefault();
          }

          $column.width(width);
          drag.position(new $.Vector(width - $drag.width() / 2 + $column.offset().left, drag.location.y()));
        }

        , dragend: $.proxy(function (e, drag) {
          // Reset position
          $(drag.element).css({
              position: "absolute"
            , right: "-12px"
            , left: "auto"
          });

          this.currentAction = null;
        }, this)
      }, ".x-resize");
    }

    , setupRemove: function () {
      this.$el.on("click", ".x-remove", function () {
        if (confirm("Are you sure you want to remove this element?")) {
          $(this).parent().remove();
        }
      });
    }
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
      "click button[type=submit]": "loginUser"
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
        , url: "/session.json"
        , data: JSON.stringify(data)
        , complete: function (jqXHR, textStatus) {
          var response = JSON.parse(jqXHR.responseText);

          switch (textStatus) {
            case "success":
              this.model.set(response);

              this.$el.modal("hide");
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

window.require.define({"views/register": function(exports, require, module) {
  var View = require("views/base/view")
    , app = require("application");

  module.exports = View.extend({
      className: "modal"
    , template: "register"
    , model: app.currentUser

    , events: {
      "click .submit": "createUser"
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

window.require.define({"views/style_edit": function(exports, require, module) {
  var View = require("views/base/view")
    , template = require("views/templates/style_edit");

  module.exports = View.extend({
      el: $("<div id='x-style-edit'></div>")

    , render: function () {
      this.$el.html(template());

      return this;
    }
  });
  
}});

window.require.define({"views/template_select": function(exports, require, module) {
  var View = require("views/base/view")
    , Templates = require("collections/templates")
    , app = require("application");

  module.exports = View.extend({
      el: $("<div id='x-templates-select'><h4><label>Current Template</label></h4>\
            <form><select></select></form></div>")

    , collection: new Templates(app.data.templates)

    , initialize: function (options) {
      this.bindEvents();
    }

    , render: function () {
      this.collection.reset(this.collection.models);

      return this;
    }

    , bindEvents: function () {
      this.collection.on("add", this.addOne, this);
      this.collection.on("reset", this.addAll, this);

      $(window.document).on("change", this.$el, $.proxy(this.switchTemplate, this));
    }

    , addOne: function (template) {
      var selected = "";

      if (template.get("current")) {
        // Load selected attribute
        selected = " selected='selected'";

        // Save current template
        this.currentTemplate = template;
      }

      this.$("select").append("<option value='" + template.cid + "'" + selected + ">"
                      + template.get("name") + "</option>");
    }

    , addAll: function () {
      this.$("select").empty();

      _.each(this.collection.models, function (template) {
        this.addOne(template);
      }, this);
    }

    , switchTemplate: function (e) {
      var modelCid = $(e.target).val()
        , template = this.collection.getByCid(modelCid);

      // Reset current template
      if (this.currentTemplate) {
        this.currentTemplate.set("current", false);
      }
      template.set("current", true);

      // Load template file
      window.location.href = template.get("filename") + ".html";
    }
  });
  
}});

window.require.define({"views/templates/auth_links": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this;

  function program1(depth0,data) {
    
    
    return "\n  <a href=\"/upload\" class=\"btn\" id=\"upload_theme\">Upload</a>\n  <button class=\"btn\" id=\"logout\">Log out</button>\n";}

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


    return "<div class=\"page-header\">\n  <h1>\n    Premium Designs\n    <small>for your WordPress site</small>\n  </h1>\n</div>\n<p class=\"lead\">Customize before you download! Start by choosing a theme below.\n(<a data-toggle=\"collapse\" data-bypass=\"true\" href=\"#faq\">FAQ</a>)</p>\n\n<div id=\"faq\" class=\"collapse\">\n  <h3>Frequently Asked Questions</h3>\n  <h4>How it works?</h4>\n  <ul>\n    <li>Scroll down the page to see the full list of all the themes and choose the one you like.</li>\n    <li>When you find the theme you want, click the \"Customize\" button and you will be taken\n    to the customizer where you can make edits until you are satisfied.</li>\n    <li>Then, click on \"Download\" to download the WordPress theme with your customizations included.</li>\n  </ul>\n  <h4>Something doesn't work. What should I do?</h4>\n  <p>It maybe our fault and we are sorry for that. This site is a work in progress and\n  we are building new features and fixing bugs every day. Please contact us if something doesn't work for you\n  and we will quickly find a solution.</p>\n\n  <p><a data-toggle=\"collapse\" data-bypass=\"true\" href=\"#faq\"><i class=\"icon-arrow-up\"></i> Hide</a></p>\n</div>\n";});
}});

window.require.define({"views/templates/login": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Please authenticate yourself</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"email\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"password\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Log In</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Forgot your password? <a href=\"\" data-replace=\"true\">Reset</a></li>\n    <li>Don't have an account yet? <a href=\"/register\" data-replace=\"true\">Register</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/not_found": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<h1 class=\"page-header\">Ooops! We screwed up. :(</h1>\n<p class=\"lead\">Sorry, the page you were looking for doesn’t exist.</p>\n<p>Go back to <a href=\"/\" title=\"thememy.com\">homepage</a> or contact us about a problem.</p>\n";});
}});

window.require.define({"views/templates/register": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Create an account</h3>\n</div>\n<div class=\"modal-body\">\n  <form class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-first-name\">First Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"first_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-last-name\">Last Name</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"last_name\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-email\">Email Address</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"email\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password\">Password</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"password\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"new-password-confirmation\">Password Confirmation</label>\n        <div class=\"controls\">\n          <input type=\"text\" class=\"input-xlarge\" name=\"password_confirmation\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary submit\">Register</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n  <ul class=\"unstyled\">\n    <li>Already have an account? <a href=\"/login\" data-replace=\"true\">Log in</a></li>\n  </ul>\n</div>\n";});
}});

window.require.define({"views/templates/style_edit": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<h4>Style</h4>\n<form>\n  <p class=\"x-choice\">\n    <label>Element</label>\n    <input type=\"text\" value=\"#content\" />\n    <select>\n      <option>whole element</option>\n      <option>paragraphs</option>\n      <option>tables</option>\n      <option>lists</option>\n    </select>\n  </p>\n\n  <div>\n    <h5><span>&darr;</span> Box</h5>\n  </div>\n\n  <div>\n    <h5><span>&darr;</span> Character</h5>\n\n    <p>\n      <label for=\"x-font-family\">Family</label>\n      <select id=\"x-font-family\">\n        <optgroup label=\"Serif\">\n          <option value='Georgia, serif'>Georgia</option>\n          <option value='\"Palatino Linotype\", \"Book Antiqua\", Palatino, serif'>Palatino Linotype</option>\n          <option value='\"Times New Roman\", Times, serif'>Times New Roman</option>\n        </optgroup>\n        <optgroup label=\"Sans-Serif\">\n          <option value='Arial, sans-serif'>Arial</option>\n          <option value='\"Arial Black\", sans-serif'>Arial Black</option>\n          <option value='\"Comic Sans MS\", sans-serif'>Comic Sans MS</option>\n          <option value='Impact, Charcoal, sans-serif'>Impact</option>\n          <option value='\"Lucida Sans Unicode\", \"Lucida Grande\", sans-serif'>Lucida Sans Unicode</option>\n          <option value='Tahoma, Geneva, sans-serif'>Tahoma</option>\n          <option value='\"Trebuchet MS\", Helvetica, sans-serif'>Trebuchet MS</option>\n          <option value='Verdana, Geneva, sans-serif'>Verdana</option>\n        </optgroup>\n        <optgroup label=\"Monospace\">\n          <option value='\"Courier New\", Courier, monospace'>Courier New</option>\n          <option value='\"Lucida Console\", Monaco, monospace'>Lucida Console</option>\n        </optgroup>\n      </select>\n    </p>\n\n    <p>\n      <label for=\"x-font-typeface\">Typeface</label>\n      <select id=\"x-font-typeface\">\n        <option value=\"regular\">Regular</option>\n        <option value=\"italic\">Italic</option>\n        <option value=\"bold\">Bold</option>\n        <option value=\"bold italic\">Bold Italic</option>\n      </select>\n    </p>\n\n    <p>\n      <label for=\"x-font-size\">Size</label>\n      <input type=\"text\" id=\"x-font-size\" value=\"\" maxlength=\"2\" class=\"x-pixels\" /> px\n    </p>\n\n    <p>\n      <label for=\"x-font-color\">Color</label>\n      # <input type=\"text\" id=\"x-font-color\" value=\"\" maxlength=\"6\" class=\"x-color\" />\n    </p>\n  </div>\n\n  <div>\n    <h5><span>&darr;</span> Text</h5>\n  </div>\n\n  <div>\n    <h5><span>&darr;</span> Background</h5>\n  </div>\n</form>\n";});
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
    buffer += escapeExpression(stack1) + "\"><img src=\"editor/screenshot.png\" alt=\"\"></a>\n    <div class=\"caption\">\n      <h4>";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\n      <p>by <a href=\"";
    foundHelper = helpers.author_uri;
    stack1 = foundHelper || depth0.author_uri;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "author_uri", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
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


    return "<div class=\"modal-header\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n  <h3>Upload a new theme</h3>\n</div>\n<div class=\"modal-body\">\n  <form action=\"/themes.json\", method=\"POST\" enctype=\"multipart/form-data\" class=\"form-horizontal\">\n    <fieldset>\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"name\"></label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"name\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"description\"></label>\n        <div class=\"controls\">\n          <input type=\"text\" name=\"description\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <label class=\"control-label\" for=\"file\"></label>\n        <div class=\"controls\">\n          <input type=\"file\" name=\"file\" class=\"input-xlarge\">\n        </div>\n      </div>\n\n      <div class=\"control-group\">\n        <div class=\"controls\">\n          <button type=\"submit\" class=\"btn btn-primary\">Submit theme</button>\n        </div>\n      </div>\n    </fieldset>\n  </form>\n</div>\n";});
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

    , collection: new Themes(app.data.themes)

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

window.require.define({"views/theme_upload": function(exports, require, module) {
  var View = require("views/base/view");

  module.exports = View.extend({
      className: "modal"
    , template: "theme_upload"

    , initialize: function() {
      var $el = this.$el;

      $(document).ready(function() {
        var $form = $el.find("form");

        $form.submit(function(e) {
          e.preventDefault();
          var formData;

          formData = new FormData($form[0]);

          $.ajax({
              type: "POST"
            , url: "/themes.json"
            , data: formData
            , success: function(data, textStatus, jqXHR) {
                console.log(data, textStatus, jqXHR);
              }
            , error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown);
              }
            , cache: false
            , contentType: false
            , processData: false
          });

          return false;
        });
      })
    }
  });
  
}});

