require 'net/http'
require 'theme_archive/archive'

module ThemeArchive

  class HTMLArchive < Archive

    def initialize(theme)
      @locals = {}.merge(Defaults::HTML.locals(theme))
      @tags_class = LiquidTags::HTMLBlock

      super theme
    end

    protected

    def template_data(template)
      data = render_template(
        header_data(template) + template[:template] + footer_data(template),
        @locals
      )

      body = '<body><div id="page" class="hfeed site">'
      body += render_template(data, @locals)
      body += '</div></body>'

      data = before_body + beautify(body, 'html') + after_body

      # Hacky way to make image URLs relative
      data.gsub("src='/", "src='").gsub('src="/', 'src="')
    end

    def template_filename(template)
      "#{template.slug}.html"
    end

    def header_data(template)
      @theme.regions.where(
        name: 'header',
        slug: template.regions[:header]
      ).first[:template]
    end

    def footer_data(template)
      @theme.regions.where(
        name: 'footer',
        slug: template.regions[:footer]
      ).first[:template]
    end

    def before_body
      return %Q(<!DOCTYPE html>

<!-- paulirish.com/2008/conditional-stylesheets-vs-css-hacks-answer-neither/ -->
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8" />

  <!-- Set the viewport width to device width for mobile -->
  <meta name="viewport" content="width=device-width" />

  <title></title>

  <link rel="stylesheet" href="style.css">
</head>\n)
    end

    def after_body
      return "\n</html>"
    end

    def stylesheet_data(style)
      beautify(super, 'css')
    end

    def compile_other_files(zipfile)
      headers_dir = File.join(settings.root, 'public', 'images', 'headers', '*')
      Dir[headers_dir].each do |header_path|
        filename = File.basename(header_path)

        zipfile.get_output_stream("images/headers/#{filename}") do |f|
          f.puts File.read(header_path)
        end
      end
    end
  end

end
