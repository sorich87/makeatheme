define(["jquery"], function ($) {
  $(function () {
    $('[data-method]').click(function(e) {
      e.preventDefault();

      // TODO: Add "Are you sure?" if link has data-confirm = true
      var f = document.createElement('form');
      var method = $(this).attr('data-method').toLowerCase();
      $(this).after($(f).attr({
        method: 'post',
        action: $(this).attr('href'),
        style: "visibility:hidden;display:none;"
      }).append('<input type="hidden" name="_method" value="'
          + method
          + '" />'));
      $(f).submit();
    });
  });
});
