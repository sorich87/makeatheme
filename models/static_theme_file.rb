class StaticThemeFile
  include Mongoid::Document
  include Paperclip::Glue

  field :file_name, :type => String

  field :file_file_name
  field :file_content_type
  field :file_file_size,    :type => Integer
  field :file_updated_at,   :type => DateTime

  embedded_in :theme

  validates_attachment_content_type :file, :content_type=>['image/jpeg', 'image/png', 'image/gif']

  def as_json(options={})
    {
      :filename => self.file_name,
      :url => self.file.url
    }
  end


  has_attached_file :file,
    fog_public: true, # For now
    path: 'themes/:id/:filename'
end