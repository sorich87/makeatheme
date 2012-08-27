require 'paperclip'
require 'fog'
require 'static_theme_file'
require 'theme_parser'

class Theme
  include Mongoid::Document
  include Mongoid::Timestamps
  include Paperclip::Glue

  paginates_per 16

  field :name,        type: String
  field :uri,         type: String
  field :version,     type: String
  field :author_uri,  type: String
  field :description, type: String
  field :tags,        type: Array
  field :regions,     type: Array
  field :templates,   type: Array

  belongs_to :author, :class_name => 'StoreUser'

  # Fields used by Paperclip
  field :screenshot_file_name
  field :screenshot_content_type
  field :screenshot_file_size,    :type => Integer
  field :screenshot_updated_at,   :type => DateTime

  validates_presence_of [:name, :author, :author_uri, :description]

  embeds_many :static_theme_files

  has_attached_file :screenshot,
    styles: { thumb: '320x240>' },
    fog_public: true,
    path: 'themes/:id/screenshot/:style.:filename'

  # Return blocks to insert in the templates
  def blocks
    [:header_image, :menu, :search_form].map do |block|
      {
        name: block.to_s,
        template: DefaultTemplates::BLOCKS[block]
      }
    end
  end

  # Return regions including default ones
  def regions
    defaults = DefaultTemplates::REGIONS.map do |type, template|
      Hash[:type, type, :template, template]
    end

    defaults + self[:regions].map { |r| r.symbolize_keys }
  end

  # Return templates after converting hash keys to symbols
  def templates
    self[:templates].map{ |t| t.symbolize_keys }
  end

  # Get template content from name
  def template_content(name)
    templates.select { |t| t[:name] = name || 'index' }.first[:template]
  end

  # TODO: Return the location where files are stored on S3
  def static_files_dir
    "/editor"
  end

  def as_json(options={})
    {
      :_id => self._id,
      :name => self.name,
      :author => self.author.to_fullname,
      :author_uri => self.author_uri,
      :screenshot_uri => self.screenshot.url
    }
  end

  def self.create_from_zip(zip_file, attributes = {})
    theme = Theme.new(attributes)

    begin
      parser = ThemeParser.parse(zip_file)

      theme.templates = parser.templates
      theme.regions = parser.regions

      parser.static_files.each do |static_file|
        theme.static_theme_files.build(
          :file_name => static_file[:file_name],
          :file => static_file[:tempfile]
        )
      end

      theme.save
    ensure
      parser.static_files.each do |static_file|
        static_file[:tempfile].close
        static_file[:tempfile].unlink
      end
    end

    return theme
  end
end

