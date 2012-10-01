module LiquidTags
  class Block < Liquid::Tag
    def initialize(tag_name, markup, token)
      super
      @name = tag_name
      @label = unless markup.blank? then markup else 'Default' end
    end

    def render(context)
      blocks = context['blocks'].select do |block|
        block.name == @name && block.label == @label
      end

      blocks.first[:template] unless blocks.empty?
    end
  end
end
