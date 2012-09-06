require 'paperclip'
require 'fog'
require 'theme_file_group'
require 'theme_parser'
require 'static_theme_file'
require 'set'
require 'region'
require 'template'

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

  embeds_many :regions
  embeds_many :templates

  belongs_to :author, :class_name => 'StoreUser'
  belongs_to :parent, :class_name => 'Theme'
  has_many :forks, :class_name => 'Theme'

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

  belongs_to :theme_file_group, :dependent => :destroy
  has_many :static_theme_files

  has_attached_file :screenshot,
    styles: { thumb: '320x240>' },
    fog_public: true,
    path: 'themes/:id/screenshot/:style.:filename'

  has_attached_file :archive,
    fog_public: false,
    path: 'themes/:id/archives/:filename'

  validates_attachment :archive,
    :content_type => { :content_type => 'application/zip' },
    :size => { :less_than => 1.megabyte }

  # Return blocks to insert in the templates
  def blocks
    DefaultTemplates::BLOCKS.map do |name, template|
      {
        name: name.to_s,
        template: template
      }
    end
  end

  # Get template content from name
  def template_content(name)
    templates.select { |t| t[:name] = name || 'index' }.first[:template]
  end

  # Return path to where static files are stored on AWS
  def static_files_dir
    self.theme_file_group.static_files_dir
  end

  def as_json(options={})
    {
      :_id => self._id,
      :name => self.name,
      :author => self.author.to_fullname,
      :screenshot_uri => self.screenshot.url,
      :archive => if self.archive.file? then self.archive.expiring_url else nil end
    }
  end

  # TODO: Add validations & error handling
  def self.create_from_zip(zip_file, attributes = {})
    theme = Theme.new(attributes)

    begin
      parser = ThemeParser.parse(zip_file)

      theme.templates = parser.templates
      theme.regions = parser.regions

      group = theme.build_theme_file_group

      parser.static_files.each do |static_file|
        group.static_theme_files.build(
          :file_name => static_file[:filename],
          :file => static_file[:tempfile],
          :theme_id => theme.id
        ).save
      end

      group.save
      theme.save
    ensure
      parser.static_files.each do |static_file|
        static_file[:tempfile].close
        File.unlink(static_file[:tempfile])
      end
    end

    return theme
  end

  def fork(attributes={})
    Theme.new(self.attributes.merge(:parent => self).merge(attributes))
  end

  def fork!(attributes={})
    fork(attributes={}).save!
  end

  def fork?
    !self.parent.nil?
  end

  # For now all fork are private which means they can be edited by the owner only.
  # Very soon we will need to add permissions to selected users,
  # and public forks which can be forked by anyone.
  def private?
    fork?
  end

  # Return what files are needed to build this customization
  # (original theme files + ones added when customizing)
  def needed_theme_files
    (self.static_theme_files + self.theme_file_group.original_files).uniq
  end

  # Is the user author of the theme?
  def author?(user)
    user && author.id == user.id
  end

  # Can the user only preview the theme or can he edit it
  def preview_only?(user)
    !author?(user) && private?
  end

  def path
    self.name.gsub(/[^0-9A-Za-z]/, '').downcase
  end
end

