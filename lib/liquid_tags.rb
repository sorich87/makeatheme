module LiquidTags
  class Block < Liquid::Tag
    def initialize(tag_name, markup, token)
      super
      @name = tag_name
      @label = if markup.blank? then 'Default' else markup.strip end
    end

    def render(context)
      blocks = context['blocks'].select do |block|
        block[:name] == @name && block[:label] == @label
      end

      blocks.first[:build] unless blocks.empty?
    end
  end

  class HTMLBlock < Block
    def render(context)
      blocks = context['blocks'].select do |block|
        block[:name] == @name && block[:label] == @label
      end

      blocks.first[:template] unless blocks.empty?
    end
  end

  class PHPBlock < Block
    def render(context)
      blocks = context['blocks'].select do |block|
        block[:name] == @name && block[:label] == @label
      end

      # convert 'article' key to 'article-slug' for single and page templates
      if %w(single page).include?(@label)
        @name = "#{@name}-#{@label}"
      else
        @name = @name.to_sym
      end

      template = ERB.new(Defaults::PHP::CONTENT[@name])
      template.result(get_binding(blocks.first))
    end

    def get_binding(block)
      binding
    end
  end

  module Helpers
    # Create a context that can be passed to the templates for rendering
    class ThemeContext
      attr_accessor :blocks

      def initialize(theme)
        @blocks = theme.blocks
      end

      # Used by Tilt to pass scope to Liquid templates
      def to_h
        {
          blocks: @blocks
        }
      end
    end
  end
end
