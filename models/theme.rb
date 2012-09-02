require 'paperclip'
require 'fog'
require 'theme_file_group'
require 'theme_parser'
require 'static_theme_file'
require 'set'

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
  field :regions,     type: Array, :default => []
  field :templates,   type: Array, :default => []

  belongs_to :author, :class_name => 'StoreUser'
  belongs_to :parent, :class_name => 'Theme'

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
      Hash[:type, type, :template, template, :name, 'default']
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
    self.theme_file_group.static_files_dir
  end

  def as_json(options={})
    {
      :_id => self._id,
      :name => self.name,
      :author => self.author.to_fullname,
      :screenshot_uri => self.screenshot.url,
      :archive => self.archive.expiring_url
    }
  end

  # TODO: Add validations & error handling
  def self.create_from_zip(zip_file, attributes = {})
    theme = Theme.new(attributes)

    File.open(zip_file) do |f|
      theme.archive = f
    end

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

  def fork!(attributes={})
    Theme.new(self.attributes.merge(:parent => self).merge(attributes))
  end

  def forks
    Theme.where(:parent => self)
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

  # Replace templates that exist with new ones and add
  # those that do not exist.
  def replace_and_add_templates(templates)
    templates.each do |new_template|
      index = self.templates.index {|t| t[:name] == new_template[:name]}
      if index
        puts "Replacing template: #{new_template[:name]}"
        self[:templates][index] = new_template
      else
        puts "Adding template: #{new_template[:name]}"
        self[:templates] << new_template
      end
    end
  end

  def replace_and_add_regions(regions)
    regions.each do |new_region|
      index = self.regions.index {|r| r[:name] == new_region[:name]}
      if index
        puts "Replacing region: #{new_region[:name]}"
        self[:regions][index] = new_region
      else
        puts "Adding region: #{new_region[:name]}"
        self[:regions] << new_region
      end
    end
  end
end

