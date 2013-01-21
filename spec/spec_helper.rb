require 'rspec'
require 'rack/test'
require 'mongoid-rspec'
require 'paperclip/matchers'
require 'database_cleaner'
require 'simplecov'

SimpleCov.start

ENV['RACK_ENV'] = 'test'

require './app'

def app
  Sinatra::Application
end

Fog.mock!

# Sample restricted path as we don't have one :]
get '/restricted' do
  forbid and return unless authenticated?
  status 201
end

# http://stackoverflow.com/q/8504101/354531
def do_not_send_email
  Pony.stub!(:deliver)
end

Dir["./spec/support/**/*.rb"].sort.each {|f| require f}

RSpec.configure do |conf|
  conf.include Rack::Test::Methods
  conf.include Mongoid::Matchers
  conf.include Paperclip::Shoulda::Matchers
  conf.include SessionHelpers
  conf.mock_with :rspec

  conf.before(:suite) do
    DatabaseCleaner[:mongoid].strategy = :truncation
  end

  conf.before(:each) do
    DatabaseCleaner.clean
    do_not_send_email
    header 'Accept', 'application/json'
  end
end

