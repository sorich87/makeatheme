class Block
  include Mongoid::Document

  field :name, type: String
  field :label, type: String
  field :template, type: String

  embedded_in :theme

  # Filename in WordPress archive
  def wordpress_filename
    filename = self[:name]

    unless self[:label].nil? || self[:label].downcase == 'default'
      filename += "-#{self[:label].underscore}"
    end

    "#{filename}.php"
  end
end
