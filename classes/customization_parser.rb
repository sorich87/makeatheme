require 'zip/zip'
require 'classes/customization_constants'

class CustomizationParser
  def self.parse(json_string)
    self.new(json_string)
  end

  def initialize(theme)
    @theme = theme

    @base = {}

    merge_constants

    @zipfile_name = File.expand_path(File.join(Dir.mktmpdir, "./#{@theme.path}.zip"))

    create_zip
  end

  def create_zip
    if File.exists?(@zipfile_name)
      File.delete(@zipfile_name)
    end

    folder_in_zip = "#{@theme.path}/"

    Zip::ZipFile.open(@zipfile_name, Zip::ZipFile::CREATE) do |zipfile|
      compile_regions(zipfile)
      compile_templates(zipfile)
    end
  end

  def compile_templates(zipfile)
    @theme.templates.each do |template|
      zipfile.get_output_stream("#{template[:name]}.php") do |f|
        template = "<?php get_header(); ?>" + template[:template] + "<?php get_footer(); ?>"
        f.puts render_template(template, @base)
      end
    end
  end

  def zipfile_path
    @zipfile_name
  end

  def compile_regions(zipfile)
    @theme.regions.each do |region|
      region_identifier = region[:type]
      region_identifier << "-#{region[:id]}" unless region[:id].nil?

      filename = "#{region_identifier}.php"
      zipfile.get_output_stream("#{region_identifier}.php") do |f|
        template = region[:template]

        template = CustomizationConstants::HEADER + template if 'header' == region[:type]
        template = template + CustomizationConstants::FOOTER if 'footer' == region[:type]

        f.puts render_template(template, @base)
      end
    end
  end

  def merge_constants
    @base.merge!(CustomizationConstants::CONSTANTS)
  end

  private

  def render_template(template, locals)
    # Hash keys should be strings only
    locals = locals.inject({}){ |h,(k,v)| h[k.to_s] = v ; h }

    Liquid::Template.parse(template).render(locals)
  end
end
