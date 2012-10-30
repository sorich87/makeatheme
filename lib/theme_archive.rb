require 'zip/zip'
require 'pathname'
require 'erb'

module ThemeArchive

  def generate_archive
    File.open(Archive.new(self).path) { |file| self.wp_archive = file }
  end

  def generate_archive!
    self.generate_archive
    self.save
  end

  class Archive
    attr_reader :path

    def initialize(theme)
      @theme = theme

      @locals = {}
      @locals.merge!(Defaults::PHP::CONTENT)

      @path = File.join(Dir.mktmpdir, "./#{@theme.slug}.zip")

      # Register block tags
      %w(header_image navigation search_form article sidebar).map do |name, template|
        Liquid::Template.register_tag(name, LiquidTags::PHPBlock)
      end

      create_zip
    end

    def create_zip
      if File.exists?(@path)
        File.delete(@path)
      end

      Zip::ZipFile.open(@path, Zip::ZipFile::CREATE) do |zipfile|
        compile_regions(zipfile)
        compile_templates(zipfile)
        compile_sidebars(zipfile)
        compile_php_files(zipfile)
        compile_stylesheet(zipfile)
        compile_static_files(zipfile)
        compile_screenshot(zipfile)
      end
    end

    private

    def compile_templates(zipfile)
      @theme.templates.each do |template|
        zipfile.get_output_stream(template.filename) do |f|
          header = get_header_tag(template)
          footer = get_footer_tag(template)

          # Add template name comment before header if template is not a default one.
          unless Defaults::WP::TEMPLATES.include?(template.name)
            header = "/**\n * Template Name: #{template.name}\n */\n" + header
          end

          f.puts render_template(header + template[:template] + footer, @locals)
        end
      end
    end

    def get_header_tag(template)
      if template.regions[:header] == 'default'
        '<?php get_header(); ?>'
      else
        "<?php get_header('#{template.regions[:header]}'); ?>"
      end
    end

    def get_footer_tag(template)
      if template.regions[:footer] == 'default'
        '<?php get_footer(); ?>'
      else
        "<?php get_footer('#{template.regions[:footer]}'); ?>"
      end
    end

    def compile_regions(zipfile)
      @theme.regions.each do |region|
        zipfile.get_output_stream(region.filename) do |f|
          template = region[:template]

          template = Defaults::PHP::REGIONS[:header] + template if 'header' == region[:name]
          template = template + Defaults::PHP::REGIONS[:footer] if 'footer' == region[:name]

          f.puts render_template(template, @locals)
        end
      end
    end

    def compile_sidebars(zipfile)
      @theme.blocks.where(name: 'sidebar').each do |block|
        zipfile.get_output_stream(block.wordpress_filename) do |f|
          f.puts render_template(Defaults::PHP::BLOCKS[:sidebar], block_slug: block.label.underscore)
        end
      end
    end

    def compile_static_files(zipfile)
      @theme.assets.each do |static_file|
        path = "images/#{static_file.file.original_filename}"

        zipfile.get_output_stream(path) do |f|
          file_io = Kernel.open(static_file.file.url)
          f.puts file_io.read unless file_io.nil?
        end
      end
    end

    # Insert custom style at the bottom of stylesheet
    def compile_stylesheet(zipfile)
      zipfile.get_output_stream('style.css') do |f|
        insert_wordpress_headers(f)
        f.puts @theme.css(true)
      end
    end

    # Insert wordpress headers at the top of stylesheet
    def insert_wordpress_headers(f)
      f.puts "/*"
      wordpress_headers.each do |key, value|
        f.puts "#{key}: #{value}"
      end
      f.puts "*/\n\n"
    end

    # Headers needed for Wordpress CSS
    def wordpress_headers
      {
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
    end

    def compile_php_files(zipfile)
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

    # Include screenshot file in archive
    def compile_screenshot(zipfile)
      zipfile.get_output_stream('screenshot.png') do |f|
        f.puts open(@theme.screenshot.url(:thumb)).read if @theme.screenshot.file?
      end
    end

    # This one can just sit here in case we need it.
    def add_theme_info(zipfile)
      zipfile.get_output_stream('theme.info') do |f|
        # The conversion from Mongoid::BSON::Document is a bit sad
        info = {
          }.merge(
        @theme.attributes.symbolize_keys.slice(:name, :description, :tags)).
           to_hash.stringify_keys
        YAML.dump(info, f)
      end
    end

    def render_template(template, locals)
      scope = LiquidTags::Helpers::ThemeContext.new(@theme)
      locals = scope.to_h.merge(locals)

      # Hash keys should be strings only
      locals = locals.inject({}){ |h,(k,v)| h[k.to_s] = v ; h }

      Liquid::Template.parse(template).render(locals)
    end

    def get_binding(theme)
      binding
    end
  end

end
