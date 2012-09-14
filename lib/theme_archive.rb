require 'zip/zip'
require 'pathname'
require 'erb'

module ThemeArchive

  def generate_archive
    File.open(Archive.new(self).path) { |file| self.archive = file }
  end

  def generate_archive!
    self.generate_archive
    self.save
  end

  class Archive
    def initialize(theme)
      @theme = theme

      @base = {}
      @base.merge!(Defaults::PHP::CONTENT)

      @path = File.join(Dir.mktmpdir, "./#{@theme.slug}.zip")

      create_zip
    end

    def create_zip
      if File.exists?(@path)
        File.delete(@path)
      end

      Zip::ZipFile.open(@path, Zip::ZipFile::CREATE) do |zipfile|
        compile_regions(zipfile)
        compile_templates(zipfile)
        compile_static_files(zipfile)
        compile_php_files(zipfile)
        compile_screenshot(zipfile)
        #add_theme_info(zipfile)
      end
    end

    def path
      @path
    end


    private

    def compile_templates(zipfile)
      @theme.templates.each do |template|
        zipfile.get_output_stream(template.filename) do |f|
          if template.regions[:header] == 'default'
            header = '<?php get_header(); ?>'
          else
            header = "<?php get_header('#{template.regions[:header]}'); ?>"
          end

          if template.regions[:footer] == 'default'
            footer = '<?php get_footer(); ?>'
          else
            footer = "<?php get_footer('#{template.regions[:footer]}'); ?>"
          end

          template = header + template[:template] + footer
          f.puts render_template(template, @base)
        end
      end
    end

    def compile_regions(zipfile)
      @theme.regions.each do |region|
        zipfile.get_output_stream(region.filename) do |f|
          template = region[:template]

          template = Defaults::PHP::REGIONS[:header] + template if 'header' == region[:name]
          template = template + Defaults::PHP::REGIONS[:footer] if 'footer' == region[:name]

          f.puts render_template(template, @base)
        end
      end
    end

    def compile_static_files(zipfile)
      @theme.needed_theme_files.each do |static_file|
        zipfile.get_output_stream(static_file.file_name) do |f|
          if static_file.file_name == "style.css"
            # Insert wordpress headers
            f.puts "/*"
            @theme.wordpress_headers.each do |key, value|
              f.puts "#{key}: #{value}"
            end
            f.puts "*/"
          end
          file_io = Kernel.open(static_file.file.url)
          f.puts file_io.read unless file_io.nil?
        end
      end
    end

    def compile_php_files(zipfile)
      # Find all PHP files in views/themes and get their path relative
      # to our APP_ROOT so we know which folder they'll go in.
      view_root = Pathname.new(File.join(settings.root, 'views', 'themes'))
      Dir[File.join(settings.root, 'views', 'themes', '**/*.php.erb')].each do |erb_file|
        file_path = Pathname.new(erb_file)
        zip_path = file_path.relative_path_from(view_root).to_s.split('.erb').first

        # Just compile the .erb files for now
        template = ERB.new(File.read(file_path))

        # Add it to the zipfile
        zipfile.get_output_stream(zip_path) do |f|
          f.puts template.result
        end
      end
    end

    # Include screenshot file in archive
    # Sometimes the screenshot may not be up to date,
    # we will bother about that when screenshot generation is moved to a background job
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
        @theme.attributes.symbolize_keys.slice(:name, :description, :tags).
           to_hash.stringify_keys
        YAML.dump(info, f)
      end
    end

    def render_template(template, locals)
      # Hash keys should be strings only
      locals = locals.inject({}){ |h,(k,v)| h[k.to_s] = v ; h }

      Liquid::Template.parse(template).render(locals)
    end
  end

end
