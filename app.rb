$LOAD_PATH.unshift(File.dirname(__FILE__))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'classes'))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'models'))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'helpers'))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'routes'))

require 'sinatra'
require 'sinatra/session'
require 'sinatra/respond_with'
require 'mongoid'
require 'kaminari'
require 'base64'
require 'pony'
require 'nokogiri'
require 'liquid'
require 'json'


Mongoid.load!("config/mongoid.yml")

# Load initializers
Dir["config/initializers/*.rb"].each {|file| require file }

set :session_secret, 'zup3r4z1kr149124sessionvalu123123md5!!!:3'
set :method_override, true
set :json_encoder, JSON

configure :development do
  require 'config/environments/development'
end

configure :production do
  require 'config/environments/production'
end

configure :test do
  require 'config/environments/test'
end

# Models
require 'theme'
require 'store_user'

# Classes
require 'customization_parser'
require 'default_templates'

# Helpers
require 'application_helper'
require 'session_helper'
require 'theme_helper'

# Register helper classes
helpers ApplicationHelper, SessionHelper, ThemeHelper

respond_to :html, :json

# Send index content on 404 to html client so that it handles routing
# Send 404 to other clients
error 404 do
  request.accept.each do |type|
    case type
    when 'text/html'
      load_index
    end
  end
end

# Don't send 406 to html client
error 406 do
  request.accept.each do |type|
    case type
    when 'text/html'
      load_index
    end
  end
end

# Load index
get '/', provides: 'html' do
  load_index
end

require 'session_routes'
require 'theme_routes'
require 'user_routes'
