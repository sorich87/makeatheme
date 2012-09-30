Resque.redis = ENV["REDISTOGO_URL"] if production?
Resque::Plugins::Status::Hash.expire_in = (24 * 60 * 60)
