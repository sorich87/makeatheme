require 'rspec'
require 'rack/test'

ENV['RACK_ENV'] = 'test'

require './app'

def app
  Sinatra::Application
end

RSpec.configure do |conf|
  conf.include Rack::Test::Methods
end
