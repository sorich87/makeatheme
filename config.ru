require './app'
require 'resque/server'
require 'resque/status_server'

run Rack::URLMap.new \
  "/"       => Sinatra::Application,
  "/resque" => Resque::Server.new
