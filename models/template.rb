class Template
  include Mongoid::Document

  field :name, type: String
  field :template, type: String

  embedded_in :theme
end
