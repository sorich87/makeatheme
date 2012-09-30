if production?
  uri = URI.parse(ENV["REDISTOGO_URL"])
  REDIS = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
end

Resque::Plugins::Status::Hash.expire_in = (24 * 60 * 60)
