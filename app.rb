$LOAD_PATH.unshift(File.dirname(__FILE__))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'models'))
$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), 'classes'))

require 'sinatra'
require 'sinatra/session'
require 'mongoid'
require 'kaminari'
require 'base64'

Mongoid.load!("config/mongoid.yml")

# Load initializers
Dir["config/initializers/*.rb"].each {|file| require file }

set :session_secret, 'zup3r4z1kr149124sessionvalu123123md5!!!:3'
set :method_override, true

# Models
require 'theme'
require 'store_user'

# Classes
require 'customization_parser'

helpers do
  def require_auth!
    unless session?
      # Meh this is stupid.
      redirect "/login", 403
    end
  end

  def authenticate_user!(user)
    session_start!
    session[:user_id] = user.id
  end

  def current_user
    @current_user ||= StoreUser.find(session[:user_id]) if session[:user_id]
  end

  def load_index
    themes = Theme.order_by([:name, :desc]).page(params[:page])
    erb :index, :locals => {:themes => themes}
  end

  def json_pagination_for(model)
    {
      per_page: model.default_per_page,
      total_results: model.total_count
    }
  end
end

# Set default content type to JSON
before do
  content_type :json
end

get '/' do
  content_type :html
  load_index
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
    theme.to_json
  else
    status 404
  end
end

post '/themes/:id/customize.json' do
  json = JSON.parse(request.body.read)
  puts json

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

post '/user.json' do
  user_params = JSON.parse(request.body.read)
  user_params.slice!("first_name", "last_name", "email", "password")
  user = StoreUser.new(user_params)
  if user.valid?
    user.save
    authenticate_user!(user)
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
