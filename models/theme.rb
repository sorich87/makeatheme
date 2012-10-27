require 'paperclip'
require 'fog'
require 'theme_file_group'
require 'theme_import'
require 'theme_archive'
require 'static_theme_file'
require 'set'
require 'region'
require 'template'

class Theme
  include Mongoid::Document
  include Mongoid::Timestamps
  include Paperclip::Glue
  include ThemeArchive
  include ThemeImport

  paginates_per 16

  field :name,        type: String
  field :uri,         type: String
  field :version,     type: String
  field :description, type: String
  field :tags,        type: Array,      default: []
  field :listed,      type: Boolean,    default: false
  field :style,       type: Array,      default: []

  default_scope where(listed: true)

  embeds_many :blocks
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

  attr_accessor :archive_job_id

  validates_presence_of [:name, :author, :description]
  validates_with ThemeValidator

  belongs_to :theme_file_group, :dependent => :destroy
  has_many :static_theme_files

  has_attached_file :screenshot,
    styles: { thumb: '300x225#' },
    :convert_options => { :thumb => '-strip' },
    fog_public: true,
    path: 'themes/:id/screenshot/:basename-:style.:extension',
    default_url: '/images/screenshot-missing.png'

  has_attached_file :archive,
    fog_public: false,
    path: 'themes/:id/archives/:filename'

  validates_attachment :archive,
    :content_type => { :content_type => 'application/zip' },
    :size => { :less_than => 1.megabyte }

  # Get template content from name
  def template_content(name)
    templates.select { |t| t[:name] = name || 'index' }.first[:template]
  end

  # Return path to where static files are stored on AWS
  def static_files_dir
    self.theme_file_group.static_files_dir
  end

  def css(append_assets_dir = false)
    rules = self.style.each_with_object({}) do |declaration, memo|
      memo[declaration['media']] ||= {}
      memo[declaration['media']][declaration['selector']] ||= []
      memo[declaration['media']][declaration['selector']] << declaration
    end

    string = ""
    rules.each do |media, media_rules|
      string << "@media #{media} {" if media != "all"

      media_rules.each do |selector, declarations|
        string << "#{selector} {\n"

        declarations.each do |declaration|
          if append_assets_dir
            declaration['value'].gsub!(/url\("?([^"?)]+)"?\)/,
                                      'url("' + self.static_files_dir + '/\1")')
          end

          string << "\t#{declaration['property']}: #{declaration['value']};\n"
        end

        string << "}\n";
      end

      string << '}' if media != "all"
    end
    string
  end

  def as_json(options={})
    {
      :_id => self._id,
      :name => self.name,
      :author => self.author.to_fullname,
      :author_id => self.author_id,
      :screenshot_uri => self.screenshot.url(:thumb),
      :fork => self.fork?,
      :archive_job_id => self.archive_job_id
    }
  end

  def fork(attributes={})
    Theme.new(self.attributes.merge(parent: self, listed: false).merge(attributes))
  end

  def fork!(attributes={})
    fork(attributes={}).save!
  end

  def fork?
    !self.parent.nil?
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
    !listed && !author?(user)
  end

  def slug
    self.name.gsub(/[^0-9A-Za-z]/, '').downcase
  end

  # Header images
  def header_images
    self.needed_theme_files.select { |file| file.file_name.index('images/headers') === 0 }
  end
end

