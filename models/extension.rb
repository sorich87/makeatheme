require 'models/version'

class Extension
  include Mongoid::Document
  include Mongoid::Timestamps
  #include Paperclip
  #include Paperclip::Glue

  paginates_per 16

  #before_validation :add_new_version

  field :name,            type: String
  field :current_version, type: String

  # Fields used by Paperclip
  field :screenshot_file_name
  field :screenshot_content_type
  field :screenshot_file_size,    :type => Integer
  field :screenshot_updated_at,   :type => DateTime

  embeds_many :versions, :cascade_callbacks => true do
    def current
      where(version: @base.current_version).first
    end
  end
end

require 'models/theme'
