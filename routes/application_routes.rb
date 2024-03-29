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

error do
  Ratchetio.report_exception(env['sinatra.error'])
end

get '/jobs/:job_id', provides: 'text/event-stream' do
  cache_control :no_cache

  status = Sidekiq::Status::get(params[:job_id])

  halt 404 unless status

  stream :keep_open do |out|
    if status == 'complete'
      out << "event: success\n"
      out << "data: success\n\n"
    elsif status == 'failed'
      out << "event: errors\n"
      out << "data: failed\n\n"
    else
      out << "event: ping\n"
      out << "data: #{Time.now}\n\n"
    end
  end
end
