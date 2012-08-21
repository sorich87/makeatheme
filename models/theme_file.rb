class ThemeFile
  include Mongoid::Document

  field :file_content
  field :file_name

  embedded_in :theme

  validates_presence_of [:file_content, :file_name]
end
