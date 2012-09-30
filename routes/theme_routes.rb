get '/themes' do
  @themes = Theme.all.order_by([:name, :desc]).page(params[:page])

  respond_with results: @themes, pagination: json_pagination_for(@themes)
end

get '/themes/:id' do
  theme = Theme.unscoped.find(params[:id])

  if theme
    respond_with theme
  else
    status 404
  end
end

get '/themes/:id/download' do
  theme = Theme.unscoped.find(params[:id])

  halt 404 unless theme && theme.archive.file?

  halt 401 if theme.preview_only?(current_user)

  redirect theme.archive.expiring_url
end

post '/themes' do
  halt 401 unless authenticated?

  params = JSON.parse(request.body.read, symbolize_names: true)

  theme = Theme.unscoped.where(:id => params[:parent_id]).first

  halt 404 if theme.nil?

  halt 401 if theme.preview_only?(current_user)

  theme = theme.fork({
    :author => current_user
  })

  theme.blocks = params[:blocks].map { |block| Block.new(block) }
  theme.regions = params[:regions].map { |region| Region.new(region) }
  theme.templates = params[:templates].map { |template| Template.new(template) }
  theme.style = params[:style]

  if theme.save
    generate_theme_archive(theme)

    status 201
    respond_with theme
  else
    status 400
    respond_with theme.errors
  end
end

put '/themes/:id' do
  forbid and return unless authenticated?

  params = JSON.parse(request.body.read, symbolize_names: true)

  theme = Theme.unscoped.where(:id => params[:id]).first

  status 404 and return if theme.nil?

  forbid and return unless theme.author?(current_user)

  theme.blocks = params[:blocks].map { |block| Block.new(block) }
  theme.regions = params[:regions].map { |region| Region.new(region) }
  theme.templates = params[:templates].map { |template| Template.new(template) }
  theme.style = params[:style]

  if theme.save
    generate_theme_archive(theme)

    status 201
    respond_with theme
  else
    status 400
    respond_with theme.errors
  end
end

post '/theme_upload' do
  forbid and return unless authenticated?

  file = params[:file]

  status 400 and respond_with :error => 'Theme archive missing.' if file.nil?

  intermediate = ThemeUpload.new(
    archive: file[:tempfile],
    author: current_user,
  )

  if intermediate.save
    respond_with job_id: intermediate.job_id
  else
    status 400
    respond_with intermediate.errors
  end
end

get '/preview/:theme', provides: 'html' do
  theme = Theme.unscoped.find(params[:theme])

  # Return 404 if no theme found.
  halt 404 unless theme

  preview_only = theme.preview_only?(current_user)

  pieces = theme_pieces(theme, !preview_only)

  index = pieces[:templates].select { |t| t[:name] == 'index' }[0]

  respond_with :editor,
    theme: theme.to_json,
    style: theme.style.to_json,
    pieces: pieces.to_json,
    static_files_dir: theme.static_files_dir,
    preview_only: preview_only,
    template: index[:full],
    blocks: nil
end

get '/editor/:theme/?:action?', provides: 'html' do
  theme = Theme.unscoped.find(params[:theme])

  halt 404 unless theme

  halt 401 unless params[:action] == 'fork' || theme.author?(current_user)

  respond_with :editor,
    theme: theme.to_json,
    style: theme.style.to_json,
    pieces: theme_pieces(theme, true).to_json,
    static_files_dir: theme.static_files_dir,
    blocks: all_blocks(theme).to_json,
    preview_only: nil,
    template: nil
end

get '/jobs/:job_id', provides: 'text/event-stream' do
  status = Resque::Plugins::Status::Hash.get(params[:job_id])

  stream :keep_open do |out|
    if status.completed?
      out << "event: success\n"
      out << "data: #{status.message}\n\n"
    elsif status.failed?
      out << "event: errors\n"
      out << "data: #{status.message}\n\n"
    end
  end
end
