// Template model class.
// A template can be one of the following:
// name : Label
// index : Default
// front-page : Front Page
// home : Blog
// single : Post
// page : Page
// archive : Archive
// search : Search Result
// 404 : Error 404
var Model = require("models/base/model");

module.exports = Model.extend({
  defaults: {
      name: ""
    , template: ""
    , build: ""
  }
});
