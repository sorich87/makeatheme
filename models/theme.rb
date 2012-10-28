require 'paperclip'
require 'fog'
require 'theme_import'
require 'theme_archive'
require 'asset'
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

  belongs_to :author, :class_name => 'User'
  belongs_to :parent, :class_name => 'Theme'

  has_many :forks, :class_name => 'Theme'

  has_and_belongs_to_many :assets

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

  has_attached_file :screenshot,
    styles: { thumb: '300x225#' },
    :convert_options => { :thumb => '-strip' },
    fog_public: true,
    path: ':class/:id/:attachment/:basename-:style.:extension',
    default_url: '/images/screenshot-missing.png'

  has_attached_file :archive,
    fog_public: false,
    path: ':class/:id/:attachment/:filename'

  validates_attachment :archive,
    :content_type => { :content_type => 'application/zip' },
    :size => { :less_than => 1.megabyte }

  def style
    super.collect do |rule|
      rule['value'].gsub!(/url\("?([^"?)]+)"?\)/) do
        asset_name = $1.split('/').last.strip
        asset_url = self.assets.where(file_file_name: asset_name).first.file.url
        "url(\"#{asset_url}\")"
      end
      rule
    end
  end

  # Get template content from name
  def template_content(name)
    templates.select { |t| t[:name] = name || 'index' }.first[:template]
  end

  def css(relativize_assets = false)
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
          if relativize_assets
            declaration['value'].gsub!(/url\("?([^"?)]+)"?\)/) do
              asset_name = $1.split('/').last.strip
              "url(\"images/#{asset_name}\")"
            end
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
      :archive_job_id => self.archive_job_id,
      :has_archive => self.archive.file?
    }
  end

  def fork(attributes={})
    theme = self.clone
    theme.parent = self
    theme.assign_attributes({
      listed: false,
      screenshot: nil,
      archive: nil
    }.merge(attributes))
    theme
  end

  def fork!(attributes={})
    fork(attributes={}).save!
  end

  def fork?
    !self.parent.nil?
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
end

