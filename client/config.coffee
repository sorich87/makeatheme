exports.config =
  # Edit the next line to change default build path.
  paths:
    public: '../public'

  files:
    javascripts:
      # Describes how files will be compiled & joined together.
      # Available formats:
      # * 'outputFilePath'
      # * map of ('outputFilePath': /regExp that matches input path/)
      # * map of ('outputFilePath': function that takes input path)
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^vendor/
        'test/javascripts/app.js': /^test/
      # Defines compilation order.
      # `vendor` files will be compiled before other ones
      # even if they are not present here.
      order:
        before: [
          'vendor/scripts/console-helper.js',
          'vendor/scripts/jquery.js',
          'vendor/scripts/underscore.js',
          'vendor/scripts/backbone.js',
          'vendor/scripts/backbone-history-browser.js',
          'vendor/scripts/backbone-validation.js',
          'vendor/scripts/backbone-validation-bootstrap.coffee',

          'vendor/scripts/jqueryui/jquery.ui.core.js',
          'vendor/scripts/jqueryui/jquery.ui.widget.js',
          'vendor/scripts/jqueryui/jquery.ui.mouse.js',
          'vendor/scripts/jqueryui/jquery.ui.draggable.js',
          'vendor/scripts/jqueryui/jquery.ui.droppable.js',

          'vendor/scripts/bootstrap/bootstrap-collapse.js',
          'vendor/scripts/bootstrap/bootstrap-modal.js',
          'vendor/scripts/bootstrap/bootstrap-alert.js',
          'vendor/scripts/bootstrap/bootstrap-transition.js',
          'vendor/scripts/bootstrap/bootstrap-dropdown.js'
        ]

    stylesheets:
      joinTo:
        'stylesheets/app.css': /^(app(\/|\\)styles(\/|\\)(?!editor)|vendor)/
        'stylesheets/editor.css': /^app(\/|\\)styles(\/|\\)(?=editor)/
      order:
       before: ['vendor/styles/bootstrap/bootstrap.less']
       after: ['vendor/styles/bootstrap/bootstrap-responsive.less']

    templates:
      joinTo: 'javascripts/app.js'

  # Settings of web server that will run with `brunch watch [--server]`.
  # server:
  #   # Path to your server node.js module.
  #   # If it's commented-out, brunch will use built-in express.js server.
  #   path: 'server.coffee'
  #   port: 3333
  #   # Run even without `--server` option?
  #   run: yes

  jshint:
    pattern: /^app\/.*\.js$/
    options:
      bitwise: true
      curly: true
      laxcomma: true
    globals:
      jQuery: true
