class Region
  include Mongoid::Document

  field :name, type: String
  field :slug, type: String
  field :template, type: String

  embedded_in :theme

  # Region PHP filename
  def filename
    filename = self[:name]

    unless self[:slug].nil? or self[:slug] == 'default'
      filename << "-#{self[:slug]}"
    end

    "#{filename}.php"
  end
end
