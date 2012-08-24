require 'paperclip'
require 'fog'
require 'theme_file'
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

  belongs_to :author, :class_name => 'StoreUser'

  # Fields used by Paperclip
  field :screenshot_file_name
  field :screenshot_content_type
  field :screenshot_file_size,    :type => Integer
  field :screenshot_updated_at,   :type => DateTime

  validates_presence_of [:name, :author, :author_uri, :description]

  embeds_many :theme_files
  embeds_many :static_theme_files

  def as_json(options={})
    {
      :_id => self._id,
      :name => self.name,
      :author => self.author.to_fullname,
      :author_uri => self.author_uri,
      :screenshot_uri => self.screenshot.url
    }
  end

  has_attached_file :screenshot,
    styles: { thumb: '320x240>' },
    fog_public: true,
    path: 'themes/:id/screenshot/:style.:filename'


  def self.create_from_zip(zip_file, attributes = {})
    theme = Theme.new(attributes)

    begin
      parser = ThemeParser.parse(zip_file)
      parser.stored_files.each do |stored_file|
        theme.theme_files.build(
          :file_name => stored_file[:filename],
          :file_content => stored_file[:template]
        )
      end

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

