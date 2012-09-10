class Template
  include Mongoid::Document

  field :name, type: String
  field :template, type: String
  field :regions, type: Hash, default: {header: 'default', footer: 'default'}

  embedded_in :theme

  def regions
    self[:regions].symbolize_keys
  end

  # PHP filename
  def filename
    "#{self[:name].parameterize}.php"
  end
end
