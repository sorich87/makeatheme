module ApplicationHelper

  def load_index
    content_type :html
    status 200
    themes = Theme.order_by([:name, :desc]).page(params[:page])
    respond_with :index, :themes => themes
  end

  def json_pagination_for(model)
    {
      per_page: model.default_per_page,
      total_results: model.total_count
    }
  end

  def send_event(name, args, user_id)
    args.collect! {|arg| "\"#{arg}\""}
    data = "data: {\n"
    data << "data: \"name\": \"#{name}\",\n"
    data << "data: \"args\": [#{args.join(', ')}]\n"
    data << "data: }\n\n"

    settings.connections[user_id] = [] if settings.connections[user_id].nil?

    settings.connections[user_id].each do |out|
      out << data
    end
  end

end
