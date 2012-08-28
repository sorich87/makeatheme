$LOAD_PATH.unshift(File.dirname(__FILE__))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'classes'))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'models'))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'helpers'))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'routes'))

require 'sinatra'
require 'sinatra/session'
require 'mongoid'
require 'kaminari'
require 'base64'
require 'pony'

Mongoid.load!("config/mongoid.yml")

# Load initializers
Dir["config/initializers/*.rb"].each {|file| require file }

set :session_secret, 'zup3r4z1kr149124sessionvalu123123md5!!!:3'
set :method_override, true

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
require 'handlebars_template'

# Helpers
require 'application_helper'
require 'handlebars_helper'
require 'session_helper'
require 'theme_helper'

# Register Handlebars template engine
Tilt.register HandlebarsTemplate, :hbs

# Register helper classes
helpers ApplicationHelper, HandlebarsHelper, SessionHelper, ThemeHelper

# Set default content type to JSON
before do
  content_type :json
end

# Sent index content on 404 so that client app handles routing
not_found do
  status 200
  load_index
end

# Routes
get '/' do
  load_index
end

require 'session_routes'
require 'theme_routes'
require 'user_routes'
