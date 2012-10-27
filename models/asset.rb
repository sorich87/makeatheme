class Asset
  include Mongoid::Document
  include Paperclip::Glue

  field :file_name, :type => String

  field :file_file_name
  field :file_content_type
  field :file_file_size,    :type => Integer
  field :file_updated_at,   :type => DateTime

  belongs_to :group, class_name: 'ThemeFileGroup'
  belongs_to :theme

  validates_attachment_content_type :file,
    :content_type => ['image/jpeg', 'image/png', 'image/gif',
                      'text/css', 'text/plain',
                      'application/javascript', 'application/x-javascript', 'text/javascript',
                      'application/ecmascript', 'text/ecmascript']

  def as_json(options={})
    {
      :filename => self.file_name,
      :url => self.file.url
    }
  end

  has_attached_file :file,
    fog_public: true, # For now
    path: 'themes/:group_id/:processed_filename',
    url: 'themes/:group_id/:processed_filename'

  Paperclip.interpolates :processed_filename do |attachment, style|
    attachment.instance.file_name
  end

  Paperclip.interpolates :group_id do |attachment, style|
    attachment.instance.group_id
  end
end
