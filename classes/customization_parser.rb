require 'json'
require 'handlebars'
require 'zip/zip'
require 'classes/customization_constants'

# TODO: Don't write files to FS, can write them to .zip
#       (This was the example code on GitHub that I used
#        when my internet was temporarily gone)

# TODO: CLEAN THIS ONE UP

class CustomizationParser
  def self.parse(json_string)
    self.new(json_string)
  end

  def initialize(json_string)
    if json_string.is_a? String
      @json = JSON.parse(json_string)
    else
      @json = json_string
    end

    @handlebars = Handlebars::Context.new
    @base = {}
    @files = []

    @input_folder = File.join('public', 'editor')
    @output_folder = Dir.mktmpdir # Temporary.

    merge_constants
    compile_regions
    compile_templates

    @zipfile_name = File.expand_path(File.join(@output_folder, './theme.zip'))

    create_zip
  end

  def create_zip
    if File.exists?(@zipfile_name)
      File.delete(@zipfile_name)
    end

    folder_in_zip = "theme/"

    Zip::ZipFile.open(@zipfile_name, Zip::ZipFile::CREATE) do |zipfile|
      @files.each do |file_path|
        filename_in_zip = "#{folder_in_zip}#{File.basename(file_path)}"
        zipfile.add(filename_in_zip, file_path)
      end
    end
  end

  def compile_templates
    @templates ||= []

    @json[:templates].each do |template|
      #template["compiled_template"] = @handlebars.compile(template["template"]).call(@base)

      # Read the file from public/editor/<file>.html for now
      input_file = File.join('public', 'editor', "#{template[:name]}.html")
      input_html = File.read(input_file)
      compiled_template = @handlebars.compile(input_html).call(@base)

      php_filename = File.join(@output_folder, "#{template[:name]}.php")

      File.open(php_filename, 'w') do |f|
        puts "Writing template to: #{php_filename}"
        f << compiled_template
      end

      @files << File.expand_path(php_filename)
      @templates << File.expand_path(php_filename)
    end
  end

  def templates
    @templates
  end

  def zipfile_path
    @zipfile_name
  end

  def base
    @base
  end

  def compile_regions
    @regions ||= []

    @json[:regions].each do |region|
      region_id = region[:id]
      region_type = region[:type]

      region_identifier = region_type
      region_identifier << "-#{region_id}" unless region_id.nil?

      filename = "#{region_identifier}.php"
      output_path = File.join(@output_folder, filename)

      template = region[:template]
      compiled_template = @handlebars.compile(template).call(@base)

      File.open(output_path, 'w') do |f|
        puts "Writing region to: #{output_path}"
        f << compiled_template
      end

      @files << File.expand_path(output_path)
      @regions << filename

      php_function = "<?php get_#{region_type}(); ?>" # TODO: Add region id if one is given
      @base[region_identifier] = php_function
    end
  end

  def merge_constants
    @base.merge!(CustomizationConstants::CONSTANTS)
  end

  def get_region_template(region_identifier)
    @regions[region_identifier]
  end
end
