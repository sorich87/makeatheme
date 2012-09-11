
get '/themes' do
  @themes = Theme.all.order_by([:name, :desc]).page(params[:page])

  respond_with results: @themes, pagination: json_pagination_for(@themes)
end

get '/themes/:id' do
  theme = Theme.find(params[:id])
  if theme
    respond_with theme
  else
    status 404
  end
end

put '/themes/:id' do
  forbid and return unless authenticated?

  theme = Theme.unscoped.where(:id => params[:id]).first

  status 404 and return if theme.nil?

  forbid and return if theme.preview_only?(current_user)

  theme = theme.fork({
    :author => current_user
  }) unless theme.author?(current_user)

  params = JSON.parse(request.body.read)
  theme.regions = params['regions'].map { |region| Region.new(region) }
  theme.templates = params['templates'].map { |template| Template.new(template) }

  if theme.valid?
    theme.generate_archive
    theme.save

    # Generate screenshot. Should be later moved to a background job.
    begin
      open(url("/screenshot/#{theme.id}"), read_timeout: 0.001)
    rescue
    end

    status 201
    respond_with theme
  else
    status 400
    respond_with theme.errors
  end
end

post '/themes' do
  forbid and return unless authenticated?

  file = params[:file]
  if file.nil?
    status 400
    respond_with :error => "Attach a .zip-file and attributes for your theme."
    return
  end

  attributes = {
    author: current_user
  }.merge(params.slice('name', 'description', 'tags'))

  theme = Theme.new_from_zip(file[:tempfile], attributes)

  if theme.valid?
    theme.save

    # Generate screenshot. Should be later moved to a background job.
    begin
      open(url("/screenshot/#{theme.id}"), read_timeout: 0.001)
    rescue
    end

    status 201
    respond_with theme
  else
    status 400
    respond_with theme.errors
  end
end

# Render a theme template with regions replaced
# and dummy content inserted
# Double render because regions contain tags
get '/editor/:theme', provides: 'html' do
  theme = Theme.find(params[:theme])

  # Return 404 if no theme found.
  halt 404 unless theme

  preview_only = theme.preview_only?(current_user)

  pieces = theme_pieces(theme, !preview_only)

  index = pieces[:templates].select { |t| t[:name] == 'index' }[0]

  header = pieces[:regions].select { |r|
    r[:name] == 'header' && r[:slug] == index.regions[:header]
  }[0]

  footer = pieces[:regions].select { |r|
    r[:name] == 'footer' && r[:slug] == index.regions[:footer]
  }[0]

  template = header[:build] + index[:build] + footer[:build]

  respond_with :editor,
    theme: theme.to_json,
    pieces: pieces.to_json,
    static_files_dir: theme.static_files_dir,
    preview_only: preview_only,
    template: template
end

get '/screenshot/:theme', provides: 'html' do
  theme = Theme.find(params[:theme])

  halt 404 unless theme

  script = File.join(settings.root, 'script', 'rasterize.js')
  url = url("/editor/#{theme.id}")
  path = File.join(Dir.mktmpdir, 'screenshot.png')

  `phantomjs #{script} #{url} #{path}`
  if $?.to_i == 0
    File.open(path) do |file|
      theme.screenshot = file
      theme.save
    end
    File.delete(path)
    status 201
  else
    status 500
  end
end

