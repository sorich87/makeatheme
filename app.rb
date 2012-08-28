$LOAD_PATH.unshift(File.dirname(__FILE__))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'models'))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'classes'))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'helpers'))

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

# Handlebars template engine
require 'handlebars_template'
Tilt.register HandlebarsTemplate, :hbs

# Models
require 'theme'
require 'store_user'

# Classes
require 'customization_parser'
require 'default_templates'

# Helpers
require 'application_helper'
require 'handlebars_helper'
require 'session_helper'
require 'theme_helper'

helpers ApplicationHelper, HandlebarsHelper, SessionHelper, ThemeHelper

# Set default content type to JSON
before do
  content_type :json
end

get '/' do
  load_index
end

# Render a theme template with regions replaced
# and dummy content inserted
# Double render because regions contain tags
get '/editor/:theme/?:template?' do
  content_type :html

  theme = Theme.find(params[:theme])

  # Return 404 if no theme found.
  status 404 and return unless theme

  blocks_and_regions = theme_blocks_and_regions(theme)

  locals = {
   theme: theme.to_json,
   regions: blocks_and_regions[:regions].to_json,
   blocks: blocks_and_regions[:blocks].to_json,
   template: theme_template(theme, params[:template]),
   static_files_dir: theme.static_files_dir
  }
  erb :editor, locals: locals
end

get '/themes.json' do
  @themes = Theme.all.order_by([:name, :desc]).page(params[:page])
  {
    results: @themes,
    pagination: json_pagination_for(@themes)
  }.to_json
end

get '/themes/:id.json' do
  theme = Theme.find(params[:id])
  if theme
    theme.to_json.merge(
      :templates => theme.theme_files.as_json,
      :static_files => theme.static_theme_files.as_json
    )
  else
    status 404
  end
end

post '/themes/:id/customize.json' do
  json = JSON.parse(request.body.read)

  # Adding template strings to templates here, should be in JSON or implemented
  # some other way in reality.
  json["templates"].each_with_index do |template, index|
    filename = File.join('public/editor/', "#{template['filename']}.html")
    template_string = File.read(filename)
    json["templates"][index]["template"] = template_string
  end

  cs = CustomizationParser.parse(json)
  zipfile_path = cs.zipfile_path

  response.write(Base64.encode64(File.read(zipfile_path)))
end

post '/themes.json' do
  require_auth!

  file = params[:file]
  if file.nil?
    status 400
    body( {:error => "Attach a .zip-file and attributes for your theme."}.to_json )
    return
  end

  attributes = {
    author: current_user,
    author_uri: 'http//not.implemented.example.com'
  }.merge(params.slice('name', 'description', 'tags'))

  theme = Theme.create_from_zip(file[:tempfile], attributes)

  if theme.valid?
    theme.save
    status 201
    body theme.to_json
  else
    status 400
    body theme.errors.to_json
  end
end

post '/user.json' do
  user_params = JSON.parse(request.body.read)
  user_params.slice!("first_name", "last_name", "email", "password")
  user = StoreUser.new(user_params)
  if user.valid?
    user.save
    authenticate_user!(user)

    Pony.mail :to => user.email,
              :subject => "Thank you for registering at push.ly, #{user.to_fullname}",
              :from => 'no-reply@push.ly',
              :body => erb(:user_registration_email, :locals => {:user => user})

    status 201
    body user.to_json
  else
    status 400
    body user.errors.to_json
  end
end

post '/session.json' do
  request_body = request.body.read
  if !request_body.empty?
    session_params = JSON.parse(request_body)
    user = StoreUser.authenticate(session_params["email"], session_params["password"])
  else
    user = nil
  end

  unless user.nil?
    authenticate_user!(user)
    status 201
    body user.to_json
  else
    status 400
    body( { "error" => "Invalid user or password combination" }.to_json )
  end
end

delete '/session.json' do
  session_end!
  status 204
end

not_found do
  status 200
  load_index
end
