define([
  "jquery",
  "underscore",
  "backbone",
  "data",
  "defaults",
  "collections/regions",
  "collections/blocks",
  "collections/templates",
  "collections/themes",
  "models/site"
], function ($, _, Backbone, data, defaults,
            RegionsCollection, BlocksCollection, TemplatesCollection, ThemesCollection,
            Site) {

   // Load default data
   data = _.defaults(data, defaults);

   return {
       regions: new RegionsCollection(data.regions)
     , blocks: new BlocksCollection(data.blocks)
     , templates: new TemplatesCollection(data.templates)
     , themes: new ThemesCollection(data.themes)
     , site: new Site
   };
});
