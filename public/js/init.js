define([
  "jquery",
  "underscore",
  "backbone",
  "data",
  "defaults",
  "collections/regions",
  "collections/blocks",
  "collections/templates",
  "models/site"
], function ($, _, Backbone, data, defaults,
            RegionsCollection, BlocksCollection, TemplatesCollection, Site) {

   // Load default data
   data = _.defaults(data, defaults);

   return {
       regions: new RegionsCollection(data.regions)
     , blocks: new BlocksCollection(data.blocks)
     , templates: new TemplatesCollection(data.templates)
     , site: new Site
   };
});
