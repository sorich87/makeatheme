require 'rspec'
require 'rack/test'
require 'mongoid-rspec'

ENV['RACK_ENV'] = 'test'

require './app'

def app
  Sinatra::Application
end

# Sample restricted path as we don't have one :]
get '/restricted' do
  require_auth!
  status 201
end

RSpec.configure do |conf|
  conf.include Rack::Test::Methods
  conf.include Mongoid::Matchers
end
