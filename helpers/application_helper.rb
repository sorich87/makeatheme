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

end
