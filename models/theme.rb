require 'paperclip'
require 'fog'
require 'set'

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
  field :listed,      type: Boolean,    default: false
  field :style,       type: Array,      default: []

  default_scope where(listed: true)

  embeds_many :blocks
  embeds_many :regions
  embeds_many :templates

  belongs_to :author, :class_name => 'User'
  belongs_to :parent, :class_name => 'Theme'

  has_many :forks, :class_name => 'Theme'

  has_and_belongs_to_many :assets, autosave: true

  # Fields used by Paperclip
  field :screenshot_file_name
  field :screenshot_content_type
  field :screenshot_file_size,    :type => Integer
  field :screenshot_updated_at,   :type => DateTime
  field :html_archive_file_name
  field :html_archive_content_type
  field :html_archive_file_size,    :type => Integer
  field :html_archive_updated_at,   :type => DateTime
  field :wp_archive_file_name
  field :wp_archive_content_type
  field :wp_archive_file_size,    :type => Integer
  field :wp_archive_updated_at,   :type => DateTime

  attr_accessor :archive_job_id

  validates_presence_of [:name, :author]
  validates_with ThemeValidator

  after_initialize :add_default_blocks
  after_initialize :add_default_template

  has_attached_file :screenshot,
    styles: { thumb: '300x225#' },
    :convert_options => { :thumb => '-strip' },
    fog_public: true,
    path: ':class/:id/:attachment/:basename-:style.:extension',
    default_url: '/images/screenshot-missing.png'

  has_attached_file :html_archive,
    fog_public: false,
    path: ':class/:id/:attachment/:filename'

  validates_attachment :html_archive,
    :content_type => { :content_type => 'application/zip' },
    :size => { :less_than => 1.megabyte }

  has_attached_file :wp_archive,
    fog_public: false,
    path: ':class/:id/:attachment/:filename'

  validates_attachment :wp_archive,
    :content_type => { :content_type => 'application/zip' },
    :size => { :less_than => 1.megabyte }

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
          value = declaration['value']
          if relativize_assets
            value = value.gsub(/url\("?([^")]+)"?\)/) do
              asset_name = $1.split('/').last.split('?').first.strip
              "url(\"images/#{asset_name}\")"
            end
          end
          string << "\t#{declaration['property']}: #{value};\n"
        end

        string << "}\n";
      end

      string << '}' if media != "all"
    end
    string
  end

  def external_assets
    files = []
    self.style.collect do |rule|
      rule['value'].scan(/url\("?([^")]+)"?\)/) do |url|
        files << url.first unless self.assets_urls.include?(url.first)
      end
    end
    files.flatten
  end

  def assets_urls
    self.assets.all.map do |asset|
      asset.file.url
    end
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
    theme = self.clone
    theme.parent = self
    theme.assign_attributes({
      listed: false,
      screenshot: nil,
      html_archive: nil,
      wp_archive: nil
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

  private

  def add_default_blocks
    return unless self.blocks.empty?

    self.blocks = ::Defaults::HTML::BLOCKS.collect do |name, template|
      name = name.to_s.split('-')
      {
        name: name[0],
        label: name[1].nil? ? 'Default' : name[1],
        template: template
      }
    end
  end

  def add_default_template
    return unless self.templates.empty?

    self.templates = ::Defaults::HTML::TEMPLATES.collect do |name, template|
      {
        name: name,
        template: template
      }
    end

    self.regions = ::Defaults::HTML::REGIONS.collect do |name, template|
      {
        name: name,
        slug: 'default',
        template: template
      }
    end

    style = File.open(File.expand_path('../../lib/defaults/style.css', __FILE__))
    sass_engine = Sass::Engine.new(style.read, :syntax => :scss)
    style.close
    self.style = sass_engine.to_tree.to_a
  end
end

