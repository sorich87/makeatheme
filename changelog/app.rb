require 'sinatra/base'

require 'changelog/renderers'

module Changelog
  class Application < Sinatra::Base
    helpers Renderers

    get '/' do
      render_html
    end

    get '/atom' do
      headers 'Content-Type' => 'application/atom+xml'
      render_feed 'atom'
    end

    get '/rss' do
      headers 'Content-Type' => 'application/rss+xml'
      render_feed '2.0'
    end
  end
end
