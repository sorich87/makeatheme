var data
  , app = require("application")
  , Templates = require("collections/templates")
  , Regions = require("collections/regions")
  , Blocks = require("collections/blocks")
  , CustomCSS = require("lib/custom_css");

data = sessionStorage.getItem("theme-" + app.data.theme._id);
data = JSON.parse(data);

// If no data in sessionStorage, get it from server.
if (!data) {
  data = {
    templates: app.data.theme_pieces.templates
    , regions: app.data.theme_pieces.regions
    , blocks: app.data.theme_pieces.blocks
    , style: app.data.style
  };
}

data = {
  templates: new Templates(data.templates)
  , regions: new Regions(data.regions)
  , blocks: new Blocks(data.blocks)
  , style: new CustomCSS(data.style, app.data.base_uri)
};

// Save data in sessionStorage every 1s.
setInterval(function () {
  var store = {
    templates: data.templates.toJSON()
    , regions: data.regions.toJSON()
    , blocks: data.blocks.toJSON()
    , style: data.style.values
  };

  store = JSON.stringify(store);
  sessionStorage.setItem("theme-" + app.data.theme._id, store);
}, 1000);

module.exports = data;
