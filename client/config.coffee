exports.config =
  # Edit the next line to change default build path.
  paths:
    public: '../public'

  files:
    javascripts:
      # Defines what file will be generated with `brunch generate`.
      defaultExtension: 'js'
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
          'vendor/scripts/backbone-validation.js',
          'vendor/scripts/backbone-validation-bootstrap.coffee',

          # jQuery++
          'vendor/scripts/jquerypp/jquery.compare.js',
          'vendor/scripts/jquerypp/jquery.within.js',
          'vendor/scripts/jquerypp/jquery.lang.vector.js',
          'vendor/scripts/jquerypp/jquery.event.livehack.js',
          'vendor/scripts/jquerypp/jquery.event.dom.js',
          'vendor/scripts/jquerypp/jquery.event.dom.cur_styles.js',
          'vendor/scripts/jquerypp/jquery.event.drag.js',
          'vendor/scripts/jquerypp/jquery.event.drag.limit.js',
          'vendor/scripts/jquerypp/jquery.event.drop.js',

          # Bootstrap from Twitter
          'vendor/scripts/bootstrap/bootstrap-collapse.js',
          'vendor/scripts/bootstrap/bootstrap-modal.js'
          'vendor/scripts/bootstrap/bootstrap-alert.js'
          'vendor/scripts/bootstrap/bootstrap-transition.js'
        ]
        after: ['vendor/scripts/handlebars.js']

    stylesheets:
      defaultExtension: 'styl'
      joinTo:
        'stylesheets/app.css': /^(app(\/|\\)styles(\/|\\)(?!editor)|vendor)/
        'stylesheets/editor.css': /^app(\/|\\)styles(\/|\\)(?=editor)/
      order:
       before: ['vendor/styles/bootstrap/bootstrap.less']
       after: ['vendor/styles/bootstrap/bootstrap-responsive.less']

    templates:
      defaultExtension: 'hbs'
      joinTo: 'javascripts/app.js'

  # Change this if you're using something other than backbone (e.g. 'ember').
  # Content of files, generated with `brunch generate` depends on the setting.
  # framework: 'backbone'

  # Settings of web server that will run with `brunch watch [--server]`.
  # server:
  #   # Path to your server node.js module.
  #   # If it's commented-out, brunch will use built-in express.js server.
  #   path: 'server.coffee'
  #   port: 3333
  #   # Run even without `--server` option?
  #   run: yes
