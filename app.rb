$LOAD_PATH.unshift(File.dirname(__FILE__))

require 'sinatra'
require 'sinatra/session'
require 'mongoid'
require 'kaminari'

Mongoid.load!("config/mongoid.yml", :development)

# Load initializers
Dir["config/initializers/*.rb"].each {|file| require file }

set :session_secret, 'zup3r4z1kr149124sessionvalu123123md5!!!:3'
set :method_override, true

# Models
require 'models/extension'
require 'models/store_user'

helpers do
  def require_auth!
    unless session?
      status 403
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
end

get '/' do
  load_index
end

get '/themes.json' do
  Theme.all.order_by([:name, :desc]).page(params[:page]).to_json
end

get '/themes/:id.json' do
  theme = Theme.find(params[:id])
  if theme
    theme.to_json
  else
    status 404
  end
end

post '/user.json' do
  user_params = JSON.parse(request.body.read)["user"]
  user_params.slice!("first_name", "last_name", "email", "password")
  user = StoreUser.new(user_params)
  if user.valid?
    user.save
    status 201
    body user.to_json
  else
    status 400
    body user.errors.to_json
  end
end

post '/session.json' do
  session_params = JSON.parse(request.body.read)["session"]
  user = StoreUser.authenticate(session_params["email"], session_params["password"])

  if user
    authenticate_user!(user)
    status 201
    body user.to_json
  else
    status 404
    body( { "error" => "Invalid user or password combination" }.to_json )
  end
end

delete '/session.json' do
  session_end!
  status 204
end

not_found do
  load_index
end
