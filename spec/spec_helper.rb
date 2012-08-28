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

# http://stackoverflow.com/q/8504101/354531
def do_not_send_email
  Pony.stub!(:deliver)
end

RSpec.configure do |conf|
  conf.include Rack::Test::Methods
  conf.include Mongoid::Matchers
  conf.mock_with :rspec

  conf.before(:each) do
    do_not_send_email
  end
end
