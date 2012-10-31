require 'zip/zip'
require 'pathname'
require 'erb'

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
      block_names = %w(header_image navigation search_form article sidebar)
      block_names.map do |name, template|
        Liquid::Template.register_tag(name, @tags_class)
      end
    end

    def compile_regions(zipfile)
      @theme.regions.each do |region|
        zipfile.get_output_stream(region_filename(region)) do |f|
          data = region_data(region)
          f.puts data unless data.nil?
        end
      end
    end

    def region_data(region)
    end

    def region_filename(region)
    end

    def compile_templates(zipfile)
      @theme.templates.each do |template|
        zipfile.get_output_stream(template_filename(template)) do |f|
          data = template_data(template)
          f.puts data unless data.nil?
        end
      end
    end

    def template_data(template)
    end

    def template_filename(template)
    end

    def compile_sidebars(zipfile)
      @theme.blocks.where(name: 'sidebar').each do |sidebar|
        zipfile.get_output_stream(sidebar_filename(sidebar)) do |f|
          data = sidebar_data(sidebar)
          f.puts data unless data.nil?
        end
      end
    end

    def sidebar_filename(sidebar)
    end

    def sidebar_data(sidebar)
    end

    def compile_assets(zipfile)
      @theme.assets.each do |asset|
        zipfile.get_output_stream(asset_filename(asset)) do |f|
          data = asset_data(asset)
          f.puts data unless data.nil?
        end
      end
    end

    def asset_filename(asset)
      "images/#{asset.file.original_filename}"
    end

    def asset_data(asset)
      file_io = Kernel.open(asset.file.url)
      file_io.read unless file_io.nil?
    end

    def compile_stylesheets(zipfile)
      style = @theme.css(true)
      zipfile.get_output_stream('style.css') do |f|
        data = stylesheet_data(style)
        f.puts data unless data.nil?
      end
    end

    def stylesheet_data(style)
      style
    end

    def compile_other_files(zipfile)
    end

    # Include screenshot file in archive
    def compile_screenshot(zipfile)
      zipfile.get_output_stream('screenshot.png') do |f|
        f.puts open(@theme.screenshot.url(:thumb)).read if @theme.screenshot.file?
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
