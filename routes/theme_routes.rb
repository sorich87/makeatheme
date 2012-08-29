
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
  require_auth!

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
  forbid and return unless authenticated?

  file = params[:file]
  if file.nil?
    status 400
    body( {:error => "Attach a .zip-file and attributes for your theme."}.to_json )
    return
  end

  attributes = {
    author: current_user
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

