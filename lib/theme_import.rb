require 'zip/zip'
require 'yaml'
require 'csv'
require 'nokogiri'

module ThemeImport
  def self.included receiver
    receiver.extend ClassMethods
  end

  module ClassMethods
    def new_from_zip(zip_file, attributes = {})
      theme = self.new(attributes)
      import = ThemeImport.new(zip_file)

      theme.screenshot = import.screenshot
      theme.templates = import.templates
      theme.regions = import.regions
      theme.write_attributes(import.attributes)

      return theme unless theme.valid?

      import.static_files.each do |static_file|
        static_file = Asset.new(file: static_file)
        theme.assets << static_file if static_file.valid?
      end

      absolutize_css_urls(theme)

      theme
    end

    def create_from_zip(zip_file, attributes = {})
      theme = new_from_zip(zip_file, attributes)
      theme.save
      theme
    end

    private

    def absolutize_css_urls(theme)
      theme[:style].collect do |rule|
        rule[:value].gsub!(/url\("?([^"?)]+)"?\)/) do
          asset_name = $1.split('/').last.strip
          asset = theme.assets.select do |a|
            a.file_file_name == asset_name
          end.first
          asset_url = if asset then asset.file.url else $1 end
          "url(\"#{asset_url}\")"
        end
        rule
      end
    end
  end

  class ThemeImport
    attr_accessor :templates, :regions, :screenshot, :static_files, :attributes

    def initialize(zip_file)
      @zip_file = zip_file
      @templates = []
      @regions = []
      @screenshot = nil
      @static_files = []
      @attributes = {}

      Zip::ZipFile.foreach(zip_file) { |entry| parse_entry(entry) if entry.file? }
    end

    def parse_entry(zip_file)
      filename = File.basename(zip_file.to_s)

      if filename =~ /\A[\w-]+\.liquid\z/
        add_stored_file(zip_file)
      elsif filename =~ /\Atheme\.info\z/
        read_theme_info_file(zip_file)
      elsif filename =~ /\Astyle\.css\z/
        read_css_file(zip_file)
      elsif filename =~ /\Ascreenshot\.(gif|jpg|jpeg|png)\z/
        add_screenshot_file(zip_file)
      elsif filename !=~ /\Ascreenshot\.(gif|jpg|jpeg|png)\z/ &&
        filename =~ /\A[^_\.](?>\/?[a-zA-Z0-9_-]+)+\.\w+\z/ # Ignore dotted files or __MACOSX files & such
        add_static_file(zip_file)
      end
    end

    def add_stored_file(entry)
      entry.get_input_stream do |html_file|
        template_name = File.basename(entry.to_s, '.*')
        file_content = html_file.read

        if template_name == "index"
          # themename/index.html
          # We want to ignore the themename/ later when
          # saving the static files
          @zip_folder = entry.to_s.split("index.liquid")[0]
        end

        if match = /\A(header|footer)(-)?(.*)/.match(template_name)
          if ['header', 'footer'].include?(template_name)
            region_slug = 'default'
          else
            region_slug = match[3]
          end

          @regions << {
            :slug => region_slug,
            :template => file_content,
            :name => get_region_name(template_name)
          }
        else
          @templates << {
            :name => template_name,
            :template => file_content
          }
        end
      end
    end

    def add_screenshot_file(entry)
      @screenshot = read_static_file(entry)
    end

    def add_static_file(entry)
      @static_files << read_static_file(entry)
    end

    def read_static_file(entry)
      filename = File.basename(entry.to_s)

      tempfile = File.open(File.join(Dir.mktmpdir, filename), 'w+')

      entry.get_input_stream do |entry_file|
        tempfile.write(entry_file.read)
        tempfile.rewind
      end

      tempfile
    end

    def read_theme_info_file(entry)
      entry.get_input_stream do |entry_file|
        @attributes.merge!(filter_attributes(YAML::load(entry_file.read).symbolize_keys))
      end
    end

    def read_css_file(entry)
      entry.get_input_stream do |entry_file|
        engine = Sass::Engine.new(entry_file.read, :syntax => :scss)
        @attributes[:style] = engine.to_tree.to_a
      end
    end

    private

    def filter_attributes(attributes)
      attrs = {}

      [:name, :description].each do |attr|
        attrs[attr] = attributes[attr]
      end

      attrs
    end

    def get_region_name(filename)
      match = /\A(header|footer)/.match(filename)
      match[1] if match
    end
  end

  class ThemeValidator < ::ActiveModel::Validator
    def validate(record)
      require_index(record)
      validate_regions(record)
    end

    private

    def require_index(record)
      index_found = false

      record.templates.each do |template|
        index_found = true and break if template.name == 'index'
      end

      record.errors[:base] = 'Index template is required' unless index_found
    end

    def validate_regions(record)
      record.regions.each do |region|
        doc = Nokogiri::HTML::DocumentFragment.parse(region.template)
        top_tags = doc.children.select { |node| node.is_a?(Nokogiri::XML::Element) }

        unless top_tags.length == 1 && top_tags.first.name.downcase == region.name
          record.errors[:base] = "#{region.name} should be the only top level tag in #{region.name}-#{region.slug}"
        end
      end
    end
  end
end
