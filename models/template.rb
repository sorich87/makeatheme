class Template
  include Mongoid::Document

  field :name, type: String
  field :template, type: String
  field :regions, type: Hash, default: {header: 'default', footer: 'default'}

  embedded_in :theme
end
