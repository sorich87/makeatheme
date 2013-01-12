get '/themes' do
  @themes = Theme.all.order_by([:name, :desc]).page(params[:page])

  respond_with results: @themes, pagination: json_pagination_for(@themes)
end

get '/themes/:id' do
  respond_with theme
end

post '/themes' do
  protect!

  id = JSON.parse(request.body.read)['id']

  copy = Theme.unscoped.find(id).fork(author: current_user)
  copy.save

  Jobs::ThemeArchive.perform_async(copy.id)

  halt copy.to_json
end

get '/themes/:id/edit', provides: 'html' do
  respond_with_editor!
end

get '/themes/:id/preview', provides: 'html' do
  respond_with_preview!
end

get '/themes/:id/download' do
  archive = theme.wp_archive

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

delete '/themes/:id' do
  protect!

  halt 401 unless theme.author?(current_user)

  theme.destroy
end
