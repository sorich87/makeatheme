require 'paperclip'
require 'pathname' # Because Paperclip doesn't require it and fails

# TODO: Find out why giving it the fog.yml file fails.
Paperclip::Attachment.default_options[:storage] = :fog
Paperclip::Attachment.default_options[:fog_credentials] = {
  aws_access_key_id: 'AKIAJJWCERXLBPMNAGGA',
  aws_secret_access_key: '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',
  provider: 'AWS'
}
Paperclip::Attachment.default_options[:fog_directory] = 'thememy-test'

