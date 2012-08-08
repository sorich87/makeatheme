require 'models/version'
require 'paperclip'
require 'fog'

class Extension
  include Mongoid::Document
  include Mongoid::Timestamps
  #include Paperclip
  include Paperclip::Glue

  paginates_per 16

  #before_validation :add_new_version

  field :name,            type: String
  field :current_version, type: String

  # Fields used by Paperclip
  field :screenshot_file_name
  field :screenshot_content_type
  field :screenshot_file_size,    :type => Integer
  field :screenshot_updated_at,   :type => DateTime

  has_attached_file :screenshot,
    styles: { thumb: '320x240>' },
    fog_public: true,
    path: 'extensions/:attachment/:id/:style/:filename'

  embeds_many :versions, :cascade_callbacks => true do
    def current
      where(version: @base.current_version).first
    end
  end
end

require 'models/theme'
