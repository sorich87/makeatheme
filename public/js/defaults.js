define(function () {
  return {
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
        , current: true
      }
      , {
          filename: "page"
        , name: "Page"
      }
    ]
  };
});
