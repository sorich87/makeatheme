require 'sinatra'
require "sinatra/reloader" if development?

$LOAD_PATH.unshift(settings.root)
$LOAD_PATH.unshift(File.join(settings.root, 'lib'))
$LOAD_PATH.unshift(File.join(settings.root, 'models'))
$LOAD_PATH.unshift(File.join(settings.root, 'helpers'))
$LOAD_PATH.unshift(File.join(settings.root, 'routes'))

require 'sinatra/session'
require 'sinatra/respond_with'
require 'mongoid'
require 'mongoid-grid_fs'
require 'kaminari'
require 'base64'
require 'pony'
require 'nokogiri'
require 'liquid'
require 'json'
require 'resque'
require 'resque-status'

Mongoid.load!("config/mongoid.yml")

# Load initializers
Dir["config/initializers/*.rb"].each {|file| require file }

# Load jobs
Dir["lib/jobs/*.rb"].each {|file| require file }

set :session_secret, 'zup3r4z1kr149124sessionvalu123123md5!!!:3'
set :method_override, true
set :json_encoder, JSON
set :reload_templates, true # https://github.com/sinatra/sinatra-contrib/issues/33
set :connections, {}

require "config/environments/#{settings.environment}"

# Models
Dir["models/*.rb"].each {|file| require file}

# Classes
require 'defaults'

# Helpers
require 'application_helper'
require 'session_helper'
require 'theme_helper'

# Register helper classes
helpers ApplicationHelper, SessionHelper, ThemeHelper

respond_to :html, :json

require 'application_routes'
require 'session_routes'
require 'theme_routes'
require 'user_routes'
