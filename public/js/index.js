require(["jquery"], function($) {
  $(function () {
    require(["bootstrap/js/bootstrap-collapse"], function () {
      // Show FAQ on index, collapsed by default
      $(".collapse").collapse();
      $("[href='#faq']").on("click", function (e) { e.preventDefault() });
    });

    require(["bootstrap/js/bootstrap-modal"], function () {
      // Hide modal previously shown before showing a new one
      $("#register, #login, #new-password, #confirm-password").on("show", function () {
        $("#register, #login, #new-password, #confirm-password").not("#" + this.id).modal("hide");
      })
    });

    $('[data-method]').click(function() {
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
      return false;
    })
  });
});
