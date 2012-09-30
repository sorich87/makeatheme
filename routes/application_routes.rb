# Send index content on 404 to html client so that it handles routing
# Send 404 to other clients
error 404 do
  request.accept.each do |type|
    case type
    when 'text/html'
      load_index
    end
  end
end

# Don't send 406 to html client
error 406 do
  request.accept.each do |type|
    case type
    when 'text/html'
      load_index
    end
  end
end

# Load index
get '/', provides: 'html' do
  load_index
end

get '/events/:user_id', provides: 'text/event-stream' do
  user_id = params[:user_id]

  forbid unless authenticated? && user_id == current_user.id.to_s

  stream :keep_open do |out|
    settings.connections[user_id] = [] if settings.connections[user_id].nil?

    settings.connections[user_id] << out
    out.callback { settings.connections[user_id].delete(out) }
  end
end

get '/jobs/:job_id', provides: 'text/event-stream' do
  status = Resque::Plugins::Status::Hash.get(params[:job_id])

  return unless status

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
