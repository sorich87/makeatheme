require './app'
require 'resque/server'
require 'resque/status_server'

# Protect Resque
Resque::Server.use Rack::Auth::Basic do |username, password|
  password == ENV['RESQUE_AUTH']
end if ENV['RESQUE_AUTH']

run Rack::URLMap.new \
  "/"       => Sinatra::Application,
  "/resque" => Resque::Server.new
