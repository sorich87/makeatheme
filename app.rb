require 'sinatra'
require "sinatra/reloader" if development?
require 'sinatra/session'
require 'sinatra/content_for'
require 'sinatra/respond_with'
require 'mongoid'
require 'mongoid-grid_fs'
require 'kaminari'
require 'base64'
require 'pony'
require 'nokogiri'
require 'liquid'
require 'json'
require 'gibbon'
require 'sidekiq'
require 'kiqstand'
require 'sidekiq-status'
require 'ratchetio'

$LOAD_PATH.unshift(settings.root)

Mongoid.load!(File.join('config', 'mongoid.yml'))

# Load initializers
Dir["config/initializers/*.rb"].each {|file| require_relative file}

set :session_secret, 'zup3r4z1kr149124sessionvalu123123md5!!!:3'
set :method_override, true
set :json_encoder, JSON
set :reload_templates, true # https://github.com/sinatra/sinatra-contrib/issues/33
set :connections, {}

mime_type :ttf, 'font/ttf'
mime_type :woff, 'font/woff'
mime_type :eot, 'application/vnd.ms-fontobject'
mime_type :svg, 'image/svg+xml'

require_relative File.join('config', 'environments', settings.environment.to_s)

# Libs
Dir["lib/*.rb"].each {|file| require_relative file}

# Load jobs
Dir["lib/jobs/*.rb"].each {|file| require_relative file}

# Models
Dir["models/*.rb"].each {|file| require_relative file}

# Helpers
Dir["helpers/*.rb"].each {|file| require_relative file}

# Register helper classes
helpers ApplicationHelper, SessionHelper, ThemeHelper

respond_to :html, :json

# Routes
Dir["routes/*.rb"].each {|file| require_relative file}
