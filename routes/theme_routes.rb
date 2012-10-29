get '/themes' do
  @themes = Theme.all.order_by([:name, :desc]).page(params[:page])

  respond_with results: @themes, pagination: json_pagination_for(@themes)
end

get '/themes/new' do
  protect!

  new_theme = Theme.new(
    name: DateTime.now.strftime('%m/%d/%Y at %I:%M%p'),
    author: current_user
  )
  new_theme.save

  redirect to "/themes/#{new_theme.id}"
end

get '/themes/:id' do
  respond_with theme
end

get '/themes/:id/fork' do
  protect!

  fork = theme.fork(author: current_user)
  fork.save

  redirect to "/themes/#{fork.id}"
end

get '/themes/:id/edit', provides: 'html' do
  respond_with_editor!
end

get '/themes/:id/preview', provides: 'html' do
  respond_with_preview!
end

get '/themes/:id/download' do
  halt 404 unless theme.archive.file?

  halt 401 if theme.preview_only?(current_user)

  redirect theme.archive.expiring_url
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
