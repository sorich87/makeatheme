
get '/events/:user_id', provides: 'text/event-stream' do
  user_id = params[:user_id]

  forbid unless authenticated? && user_id == current_user.id.to_s

  stream :keep_open do |out|
    settings.connections[user_id] = [] if settings.connections[user_id].nil?

    settings.connections[user_id] << out
    out.callback { settings.connections[user_id].delete(out) }
  end
end
