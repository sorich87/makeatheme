require 'paperclip'
require 'pathname' # Because Paperclip doesn't require it and fails

fog_creds_file = File.read(File.join(settings.root, 'config', 'fog.yml'))
fog_creds = YAML::load(ERB.new(fog_creds_file).result)[settings.environment.to_s]

Paperclip::Attachment.default_options[:storage] = :fog
Paperclip::Attachment.default_options[:fog_credentials] = fog_creds
Paperclip::Attachment.default_options[:fog_directory] = production? ? ENV['AWS_S3_BUCKET_NAME'] : 'thememy-test'

