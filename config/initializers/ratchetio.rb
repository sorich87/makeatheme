configure do
  Ratchetio.configure do |config|
    config.access_token = ENV['RATCHET_TOKEN']
    config.environment = settings.environment.to_s
  end
end
