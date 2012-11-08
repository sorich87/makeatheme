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
