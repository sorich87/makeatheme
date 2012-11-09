if production?
  if ENV['REDIS_PASSWORD'].nil?
    services = JSON.parse(ENV['VCAP_SERVICES'])
    redis_key = services.keys.select { |svc| svc =~ /redis/i }.first
    redis = services[redis_key].first['credentials']
    Resque.redis = Redis.new(
      host: redis['hostname'],
      port: redis['port'],
      password: redis['password']
    )
  else
    Resque.redis = Redis.new(
      host: 'localhost',
      port: 10000,
      password: ENV['REDIS_PASSWORD']
    )
  end
end
Resque::Plugins::Status::Hash.expire_in = (24 * 60 * 60)
