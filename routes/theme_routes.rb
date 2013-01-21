get '/themes' do
  @themes = Theme.all.order_by([:name, :desc]).page(params[:page])

  respond_with results: @themes, pagination: json_pagination_for(@themes)
end

post '/themes' do
  protect!

  new_theme = Theme.new(
    name: JSON.parse(request.body.read)['name'],
    author: current_user
  )
  new_theme.save

  if new_theme.save
    Jobs::ThemeArchive.perform_async(new_theme.id)

    halt new_theme.to_json
  else
    halt 400, new_theme.errors.to_json
  end
end

get '/themes/:id' do
  respond_with theme
end

post '/themes/fork' do
  protect!

  id = JSON.parse(request.body.read)['id']

  copy = Theme.unscoped.find(id).fork(author: current_user)
  copy.save

  Jobs::ThemeArchive.perform_async(copy.id)

  halt copy.to_json
end

put '/themes/:id' do
  protect!

  halt 401 unless theme.author?(current_user)

  params = JSON.parse(request.body.read, symbolize_names: true)

  respond_with_saved_theme!(theme, params)
end

delete '/themes/:id' do
  protect!

  halt 401 unless theme.author?(current_user)

  theme.destroy
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

