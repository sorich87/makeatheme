class Version
  include Mongoid::Document
  include Mongoid::Timestamps
  #include Paperclip
  #include Paperclip::Glue

  field :uri,         type: String
  field :version,     type: String
  field :author,      type: String
  field :author_uri,  type: String
  field :description, type: String
  field :license,     type: String
  field :license_uri, type: String

  # Theme only fields
  field :tags,        type: Array
  field :status,      type: String
  field :template,    type: String

  # Plugin only fields
  field :domain_path, type: String
  field :network,     type: String
  field :text_domain, type: String

  # Fields used by Paperclip
  field :archive_file_name
  field :archive_content_type
  field :archive_file_size,    :type => Integer
  field :archive_updated_at,   :type => DateTime
end
