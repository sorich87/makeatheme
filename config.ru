require './app'
require 'sidekiq/web'

# Protect Resque
Sidekiq::Web.use Rack::Auth::Basic do |username, password|
  password == ENV['SIDEKIQ_AUTH']
end if ENV['SIDEKIQ_AUTH']

run Rack::URLMap.new \
  "/"       => Sinatra::Application,
  "/sidekiq" => Sidekiq::Web.new
