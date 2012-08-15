require 'paperclip'
require 'fog'

class Theme
  include Mongoid::Document
  include Mongoid::Timestamps
  include Paperclip::Glue

  paginates_per 16

  field :name,        type: String
  field :author,      type: String
  field :author_uri,  type: String

  # Fields used by Paperclip
  field :screenshot_file_name
  field :screenshot_content_type
  field :screenshot_file_size,    :type => Integer
  field :screenshot_updated_at,   :type => DateTime

  validates_presence_of [:name, :author]

  def as_json(options={})
    {
      :_id => self._id,
      :name => self.name,
      :author => self.author,
      :author_uri => self.author_uri,
      :screenshot_uri => self.screenshot.url
    }
  end

  has_attached_file :screenshot,
    styles: { thumb: '320x240>' },
    fog_public: true,
    path: 'extensions/:attachment/:id/:style/:filename'
end

