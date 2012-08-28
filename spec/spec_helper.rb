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

# http://stackoverflow.com/questions/8504101/how-do-i-test-pony-emailing-in-a-sinatra-app-using-rspec
def do_not_send_email
  Pony.stub!(:deliver)
end

RSpec.configure do |conf|
  conf.include Rack::Test::Methods
  conf.include Mongoid::Matchers

  conf.before(:each) do
    do_not_send_email
  end
end
