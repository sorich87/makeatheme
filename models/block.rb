class Block
  include Mongoid::Document

  field :name, type: String
  field :label, type: String
  field :template, type: String

  embedded_in :theme
end
