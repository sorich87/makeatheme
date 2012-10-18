require 'sass'

class Sass::Tree::Visitors::ToHash < Sass::Tree::Visitors::Base
  protected

  def initialize
    @hash = {"all" => {}}
  end

  def visit(node, parent = false)
    if node_name(parent) == "root"
      @media = "all"
    end

    method = "visit_#{node_name(node)}"

    if self.respond_to?(method, true)
      self.send(method, node)
    else
      visit_children(node)
    end

    @hash
  end

  def visit_children(parent)
    parent.children.map {|c| visit(c, parent)}
  end

  def visit_root(node)
    visit_children(node)
  end

  def visit_media(node)
    @media = node.query.join('')
    @hash[@media] ||= {}
    visit_children(node)
  end

  def visit_rule(node)
    @selector = node.rule[0]
    @hash[@media][@selector] ||= {}
    visit_children(node)
  end

  def visit_prop(node)
    if node.value
      @hash[@media][@selector][node.name[0]] = node.value.to_sass
    end
  end
end

class Sass::Tree::Node
  def to_h
    Sass::Tree::Visitors::ToHash.visit(self)
  end
end
