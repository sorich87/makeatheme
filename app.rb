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

# Handlebars template engine
require 'handlebars_template'
Tilt.register HandlebarsTemplate, :hbs

# Models
require 'theme'
require 'store_user'

# Classes
require 'customization_parser'
require 'default_templates'

helpers do
  # Render handlebars template
  def hbs(*args)
    render(:hbs, *args)
  end

  # Mark a local to be returned as non escaped by handlebars
  def hbs_safe(local)
    proc { Handlebars::SafeString.new(local) }
  end

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
    content_type :html
    themes = Theme.order_by([:name, :desc]).page(params[:page])
    erb :index, :locals => {:themes => themes}
  end

  def json_pagination_for(model)
    {
      per_page: model.default_per_page,
      total_results: model.total_count
    }
  end

  # Return theme blocks and regions with Handlebars tags replaced
  def theme_blocks_and_regions(theme)
    templates = Hash[:blocks, [], :regions, []]

    locals = DefaultTemplates::CONTENT

    theme.blocks.each do |block|
      block[:template] = hbs(block[:template], locals: locals)
      templates[:blocks] << block

      # Add to locals for regions replacement
      locals[block[:name]] = block[:template]
    end

    theme.regions.each do |region|
      region[:template] = hbs(region[:template], locals: locals)
      templates[:regions] << region
    end

    templates
  end

  # Return a theme template with Handlebars tags replaced
  def theme_template(theme, template)
    locals = DefaultTemplates::CONTENT

    blocks_and_regions = theme_blocks_and_regions(theme)

    blocks_and_regions[:blocks].each do |block|
      locals[block[:name]] = block[:template]
    end

    blocks_and_regions[:regions].each do |region|
      key = region[:type]
      key += region[:name] if region[:name]
      locals[key] = region[:template]
    end

    template = theme.template_content(template)
    hbs(template, locals: locals)
  end
end

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

  locals = {
   theme: theme.to_json,
   template: theme_template(theme, params[:template])
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
