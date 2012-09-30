get '/themes' do
  @themes = Theme.all.order_by([:name, :desc]).page(params[:page])

  respond_with results: @themes, pagination: json_pagination_for(@themes)
end

get '/themes/:id' do
  respond_with theme
end

get '/themes/:id/download' do
  halt 404 unless theme.archive.file?

  halt 401 if theme.preview_only?(current_user)

  redirect theme.archive.expiring_url
end

post '/themes' do
  protect!

  params = JSON.parse(request.body.read, symbolize_names: true)

  parent_theme = Theme.unscoped.where(:id => params[:parent_id]).first

  halt 404 if parent_theme.nil?

  halt 401 if parent_theme.preview_only?(current_user)

  respond_with_saved_theme!(parent_theme, params, true)
end

put '/themes/:id' do
  protect!

  halt 401 unless theme.author?(current_user)

  params = JSON.parse(request.body.read, symbolize_names: true)

  respond_with_saved_theme!(theme, params)
end

post '/theme_upload' do
  protect!

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

get '/preview/:id', provides: 'html' do
  respond_with_editor!
end

get '/editor/:id/?:action?', provides: 'html' do
  respond_with_editor!
end
