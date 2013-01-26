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

# Sample restricted paths as we don't have one :]
get '/restricted' do
  protect!
  status 200
end

get '/admin_only' do
  admin_only!
  status 200
end

get '/admin_or_owner_only/:id' do
  user = User.find(params[:id])
  admin_or_owner_only!(user)
  status 200
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

