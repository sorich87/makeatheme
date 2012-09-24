
get '/events', provides: 'text/event-stream' do
  session_start!
  session_id = session['session_id']

  stream :keep_open do |out|
    settings.connections[session_id] = [] if settings.connections[session_id].nil?

    settings.connections[session_id] << out
    out.callback { settings.connections[session_id].delete(out) }
  end
end
