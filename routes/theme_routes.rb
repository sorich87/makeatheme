get '/themes' do
  @themes = Theme.all.order_by([:name, :desc]).page(params[:page])

  respond_with results: @themes, pagination: json_pagination_for(@themes)
end

get '/themes/:id' do
  theme = Theme.unscoped.find(params[:id])

  halt 404 unless theme

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
  theme.style = params['style']

  if theme.save
    generate_theme_screenshot(theme.reload)
    theme.generate_archive!

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
  status 400 and respond_with :error => 'Theme archive missing.' if file.nil?

  intermediate = ThemeUpload.new(:author => current_user, :archive => file[:tempfile])

  if intermediate.valid?
    intermediate.save

    status 204
  else
    status 400
    respond_with intermediate.errors
  end
end

=begin
post '/themes' do
  forbid and return unless authenticated?

  file = params[:file]

  status 400 and respond_with :error => 'Theme archive missing.' if file.nil?

  theme = Theme.create_from_zip(file[:tempfile], author: current_user)

  if theme.valid?
    theme.save

    #generate_theme_screenshot(theme)

    status 201
    respond_with theme
  else
    status 400
    respond_with theme.errors
  end
end
=end

# Render a theme template with regions replaced
# and dummy content inserted
# Double render because regions contain tags
get '/editor/:theme', provides: 'html' do
  theme = Theme.unscoped.find(params[:theme])

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
    style: theme.style.to_json,
    pieces: pieces.to_json,
    static_files_dir: theme.static_files_dir,
    preview_only: preview_only,
    template: template
end
