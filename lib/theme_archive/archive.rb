require 'zip/zip'
require 'pathname'
require 'erb'
require 'open-uri'

module ThemeArchive

  class Archive
    attr_reader :path

    def initialize(theme)
      @theme = theme
      @locals ||= {}
      @tags_class ||= LiquidTags::Block
      @path = File.join(Dir.mktmpdir, "#{@theme.slug}.zip")

      register_tags
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
        compile_stylesheets(zipfile)
        compile_other_files(zipfile)
        compile_assets(zipfile)
        compile_screenshot(zipfile)
      end
    end

    protected

    # Register block tags
    def register_tags
      block_names = %w(site_title header_image navigation search_form article sidebar credits)
      block_names.map do |name, template|
        Liquid::Template.register_tag(name, @tags_class)
      end
    end

    def compile_regions(zipfile)
      @theme.regions.each do |region|
        filename = region_filename(region)
        return if filename.nil?

        zipfile.get_output_stream("#{@theme.slug}/#{filename}") do |f|
          f.puts region_data(region)
        end
      end
    end

    def region_data(region)
    end

    def region_filename(region)
    end

    def compile_templates(zipfile)
      @theme.templates.each do |template|
        filename = template_filename(template)
        return if filename.nil?

        zipfile.get_output_stream("#{@theme.slug}/#{filename}") do |f|
          f.puts template_data(template)
        end
      end
    end

    def template_data(template)
    end

    def template_filename(template)
    end

    def compile_sidebars(zipfile)
      @theme.blocks.where(name: 'sidebar').each do |sidebar|
        filename = sidebar_filename(sidebar)
        return if filename.nil?

        zipfile.get_output_stream("#{@theme.slug}/#{filename}") do |f|
          f.puts sidebar_data(sidebar)
        end
      end
    end

    def sidebar_filename(sidebar)
    end

    def sidebar_data(sidebar)
    end

    def compile_assets(zipfile)
      @theme.assets.each do |asset|
        filename = asset_filename(asset)
        return if filename.nil?

        zipfile.get_output_stream("#{@theme.slug}/#{filename}") do |f|
          f.puts asset_data(asset)
        end
      end

      @theme.external_assets.each do |asset_url|
        filename = asset_url.split('/').last.strip
        filename = "images/#{filename}"
        zipfile.get_output_stream("#{@theme.slug}/#{filename}") do |f|
          open(asset_url, 'rb') do |io|
            f.puts io.read
          end
        end
      end
    end

    def asset_filename(asset)
      "images/#{asset.file.original_filename}"
    end

    def asset_data(asset)
      open(asset.file.url, 'rb') do |io|
        return io.read
      end
    end

    def compile_stylesheets(zipfile)
      style = @theme.css(true)
      zipfile.get_output_stream("#{@theme.slug}/style.css") do |f|
        f.puts stylesheet_data(style)
      end
    end

    def stylesheet_data(style)
      style
    end

    def compile_other_files(zipfile)
    end

    # Include screenshot file in archive
    def compile_screenshot(zipfile)
      zipfile.get_output_stream("#{@theme.slug}/screenshot.png") do |f|
        open(@theme.screenshot.url(:thumb), 'rb') do |io|
          f.puts io.read if @theme.screenshot.file?
        end
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
