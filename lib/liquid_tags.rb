module LiquidTags
  class Block < Liquid::Tag
    def initialize(tag_name, markup, token)
      super
      @name = tag_name
      @label = if markup.blank? then 'Default' else markup.strip end
    end

    def render(context)
      blocks = context['blocks'].select do |block|
        block.name == @name && block.label == @label
      end

      blocks.first[:template] unless blocks.empty?
    end
  end

  class PHPBlock < Liquid::Tag
    def initialize(tag_name, markup, token)
      super
      @name = tag_name
      @label = if markup.blank? then 'Default' else markup.strip end
    end

    def render(context)
      blocks = context['blocks'].select do |block|
        block.name == @name && block.label == @label
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
end
