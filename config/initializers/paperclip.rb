require 'paperclip'
require 'pathname' # Because Paperclip doesn't require it and fails

# TODO: Find out why giving it the fog.yml file fails.
Paperclip::Attachment.default_options[:storage] = :fog
Paperclip::Attachment.default_options[:fog_credentials] = {
  aws_access_key_id: 'AKIAJ7EH5OFSFNYHXQWA',
  aws_secret_access_key: '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',
  provider: 'AWS'
}
Paperclip::Attachment.default_options[:fog_directory] = 'thememy-test'

