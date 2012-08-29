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
  field :archive_file_name
  field :archive_content_type
  field :archive_file_size,    :type => Integer
  field :archive_updated_at,   :type => DateTime

  validates_presence_of [:name, :author, :description]

  embeds_many :static_theme_files, cascade_callbacks: true

  has_attached_file :screenshot,
    styles: { thumb: '320x240>' },
    fog_public: true,
    path: 'themes/:id/screenshot/:style.:filename'

  has_attached_file :archive,
    fog_public: false,
    path: 'themes/:id/archives/:filename'

  validates_attachment :archive,
    :presence => true,
    :content_type => { :content_type => 'application/zip' },
    :size => { :less_than => 1.megabyte }

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

  # Return path to where static files are stored on AWS
  def static_files_dir
    s = self.static_theme_files.first
    s.file.url.split(s.file_name).first[0..-2]
  end

  def as_json(options={})
    {
      :_id => self._id,
      :name => self.name,
      :author => self.author.to_fullname,
      :screenshot_uri => self.screenshot.url
    }
  end

  def self.create_from_zip(zip_file, attributes = {})
    theme = Theme.new(attributes)

    File.open(zip_file) do |f|
      theme.archive = f
    end

    begin
      parser = ThemeParser.parse(zip_file)

      theme.templates = parser.templates
      theme.regions = parser.regions

      parser.static_files.each do |static_file|
        theme.static_theme_files.build(
          :file_name => static_file[:filename],
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

