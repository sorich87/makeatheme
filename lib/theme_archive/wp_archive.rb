require 'theme_archive/archive'

module ThemeArchive

  class WPArchive < Archive

    def initialize(theme)
      @locals = {}.merge(Defaults::PHP::CONTENT)
      @tags_class = LiquidTags::PHPBlock

      super theme
    end

    protected

    def region_data(region)
      template = region[:template]

      if 'header' == region[:name]
        template = Defaults::PHP::REGIONS[:header] + template
      end

      if 'footer' == region[:name]
        template = template + Defaults::PHP::REGIONS[:footer]
      end

      render_template(template, @locals)
    end

    def region_filename(region)
      filename = region.name

      unless region.slug.nil? || region.slug == 'default'
        filename += "-#{region.slug}"
      end

      "#{filename}.php"
    end

    def template_data(template)
      header = header_tag(template)
      footer = footer_tag(template)

      # Add template name comment before header
      # if template is not a default one.
      unless Defaults::WP::TEMPLATES.include?(template.name)
        header = "/**\n * Template Name: #{template.name}\n */\n" + header
      end

      render_template(header + template[:template] + footer, @locals)
    end

    def template_filename(template)
      "#{template.slug}.php"
    end

    def header_tag(template)
      if template.regions[:header] == 'default'
        '<?php get_header(); ?>'
      else
        "<?php get_header('#{template.regions[:header]}'); ?>"
      end
    end

    def footer_tag(template)
      if template.regions[:footer] == 'default'
        '<?php get_footer(); ?>'
      else
        "<?php get_footer('#{template.regions[:footer]}'); ?>"
      end
    end

    def sidebar_filename(sidebar)
      filename = sidebar.name

      unless sidebar.label.nil? || sidebar.label.downcase == 'default'
        filename += "-#{sidebar.label.underscore}"
      end

      "#{filename}.php"
    end

    def sidebar_data(sidebar)
      render_template(Defaults::PHP::BLOCKS[:sidebar], {
        block_slug: sidebar.label.underscore
      })
    end

    def stylesheet_data(style)
      wordpress_headers + super
    end

    # Insert wordpress headers at the top of stylesheet
    def wordpress_headers
      headers = {
        'Theme Name' => @theme.name,
        'Description' => @theme.description,
        'Theme URI' => "http://makeatheme.com/themes/#{@theme.id}",
        'Author' => @theme.author.to_fullname,
        'Author URI' => "http://makeatheme.com/users/#{@theme.author_id}",
        'Version' => @theme.version,
        'Tags' => @theme.tags.join(', '),
        'License' => 'GNU General Public License v2',
        'License URI' => 'http://www.gnu.org/licenses/gpl-2.0.txt'
      }

      data = "/*\n"
      headers.each {|key, value| data += "#{key}: #{value}\n"}
      data += "*/\n\n"
    end

    def compile_other_files(zipfile)
      # Find all PHP files in views/themes and get their path relative
      # to our APP_ROOT so we know which folder they'll go in.
      view_root = Pathname.new(File.join(settings.root, 'views', 'themes'))
      Dir[File.join(settings.root, 'views', 'themes', '**/*.erb')].each do |erb_file|
        file_path = Pathname.new(erb_file)
        zip_path = file_path.relative_path_from(view_root).to_s.split('.erb').first

        # Just compile the .erb files for now
        template = ERB.new(File.read(file_path))

        # Add it to the zipfile
        zipfile.get_output_stream(zip_path) do |f|
          f.puts template.result(get_binding(@theme))
        end
      end
    end
  end

end
