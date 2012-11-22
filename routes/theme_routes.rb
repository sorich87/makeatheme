get '/themes' do
  @themes = Theme.all.order_by([:name, :desc]).page(params[:page])

  respond_with results: @themes, pagination: json_pagination_for(@themes)
end

post '/themes/new' do
  protect!

  new_theme = Theme.new(
    name: DateTime.now.strftime('%m/%d/%Y at %I:%M%p'),
    author: current_user
  )
  new_theme.save

  halt new_theme.to_json
end

get '/themes/:id' do
  respond_with theme
end

post '/themes/fork' do
  protect!

  id = JSON.parse(request.body.read)['id']

  fork = Theme.unscoped.find(id).fork(author: current_user)
  fork.save

  halt fork.to_json
end

get '/themes/:id/edit', provides: 'html' do
  respond_with_editor!
end

get '/themes/:id/preview', provides: 'html' do
  respond_with_preview!
end

get '/themes/:id/download/?:type?' do
  if params[:type] == 'wordpress'
    archive = theme.wp_archive
  else
    archive = theme.html_archive
  end

  halt 404 unless archive.file?

  halt 401 if theme.preview_only?(current_user)

  redirect archive.expiring_url
end

put '/themes/:id' do
  protect!

  halt 401 unless theme.author?(current_user)

  params = JSON.parse(request.body.read, symbolize_names: true)

  respond_with_saved_theme!(theme, params)
end

post '/themes' do
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

delete '/themes/:id' do
  protect!

  halt 401 unless theme.author?(current_user)

  theme.destroy
end
