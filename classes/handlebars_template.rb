class HandlebarsTemplate < Tilt::Template
  def self.engine_initialized?
    defined? Handlebars
  end

  def initialize_engine
    require 'handlebars'
  end

  def prepare
    handlebars = Handlebars::Context.new
    @template = handlebars.compile(data)
    @output = nil
  end

  def evaluate(scope, locals, &block)
    @output ||= @template.call(locals)
  end
end
