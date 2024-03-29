module Defaults
  module HTML
    def self.locals(theme)
      {
        site_title: 'Theme Preview',
        site_description: 'Just another beautiful theme',
        home_url: '',
        header_image_url: '/images/headers/dandelion.jpeg',
        header_image_width: '100%',
        search_form: %q(<form method="get" id="searchform" action="{{home_url}}" role="search">
  <label for="s" class="assistive-text">Search</label>
  <input type="text" class="field" name="s" id="s" placeholder="Search &hellip;" />
  <input type="submit" class="submit" name="submit" id="searchsubmit" value="Search" />
</form>),
        widget_search: %q(<aside class="widget widget_search">
  <form method="get" id="searchform">
    <label for="s" class="assistive-text">Search</label>
    <input type="text" class="field" name="s" id="s" placeholder="Search" />
    <input type="submit" class="submit" name="submit" id="searchsubmit" value="Search" />
  </form>
</aside>),
        widget_text: %q(<aside class="widget widget_text">
  <h3 class="widget-title">Some Title</h3>
  <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam dignissim
  convallis est.</p>
  <ul>
    <li>List Item 1</li>
    <li>List Item 2</li>
    <li>List Item 3</li>
  </ul>
</aside>),
        article_title: 'Sample Content',
        article_content: %q(<h2>Heading 2</h2>
<p>Lorem <sup>superscript</sup> dolor <sub>subscript</sub> amet, consectetuer
 adipiscing <a href="#" title="test link">test link</a>. Nullam dignissim
 convallis est <em>emphasis</em>. Quisque aliquam. <cite>cite</cite>.
 Donec sed tellus eget sapien fringilla nonummy.
 <acronym title="Acronym">ACR</acronym> Mauris a ante.
 Suspendisse quam sem, consequat at, commodo vitae, feugiat in, nunc. Morbi
 imperdiet augue quis tellus.  <abbr title="Abbreviation">ABBR</abbr></p>
<h3>Heading 3</h3>
<pre><p>Pre. Lorem ipsum dolor sit amet,
 consectetuer adipiscing elit.
Nunc iaculis suscipit dui.</p></pre>
<h4>Heading 4</h4>
<blockquote><p>&#8220;This stylesheet is going to help so freaking much.&#8221;
 <br />- Blockquote
</p></blockquote>
<hr />
<h5>Heading 5</h5>
<dl>
<dt>Definition List Title</dt>
<dd>This is a definition list division.</dd>
</dl>
<h6>Heading 6</h6>
<ol>
<li>List Item 1</li>
<li>List Item 2</li>
</ol>
<h6>Heading 6</h6>
<ul>
<li>List Item 1</li>
<li>List Item 2</li>
</ul>)
      }
    end

    BLOCKS = {
      site_title: %q(<hgroup>
  <h1 class="site-title"><a href="{{home_url}}" title="{{site_title}}" rel="home">{{site_title}}</a></h1>
  <h2 class="site-description">{{site_description}}</h2>
</hgroup>),

      header_image: %q(<a href="{{site_url}}">
  <img src='{{header_image_url}}' width='{{header_image_width}}' alt='' />
</a>),

      navigation: %q(<nav role="navigation">
  <ul class="menu">
    <li class="menu-item"><a href="#">Page</a>
      <ul class="sub-menu">
        <li class="menu-item"><a href="#">Third Page</a>
          <ul class="sub-menu">
            <li class="menu-item"><a href="#">Fourth Page</a></li>
          </ul>
        </li>
      </ul>
    </li>
    <li class="menu-item"><a href="#">Second Page</a></li>
  </ul>
</nav>),

      search_form: %q({{search_form}}),

      article: %Q(<article class="page hentry">
  <header class="entry-header">
    <h1 class="entry-title">{{article_title}}</h1>
  </header><!-- .entry-header -->
  <div class="entry-content">
    {{article_content}}
  </div><!-- .entry-content -->
  <footer class="entry-meta">
  </footer><!-- .entry-meta -->
</article>),

      "article-single" => %Q(<article class="page hentry">
  <header class="entry-header">
    <h1 class="entry-title">{{article_title}}</h1>
  </header><!-- .entry-header -->
  <div class="entry-content">
    {{article_content}}
  </div><!-- .entry-content -->
  <footer class="entry-meta">
  </footer><!-- .entry-meta -->
</article>),

      "article-page" => %Q(<article class="page hentry">
  <header class="entry-header">
    <h1 class="entry-title">{{article_title}}</h1>
  </header><!-- .entry-header -->
  <div class="entry-content">
    {{article_content}}
  </div><!-- .entry-content -->
  <footer class="entry-meta">
  </footer><!-- .entry-meta -->
</article>),

      "article-404" => %q(<article id="post-0" class="post error404 not-found">
  <header class="entry-header">
    <h1 class="entry-title">Oops! That page can&rsquo;t be found.</h1>
  </header><!-- .entry-header -->

  <div class="entry-content">
    <p>It looks like nothing was found at this location. Maybe try a search?</p>

    {{search_form}}
  </div><!-- .entry-content -->
</article>),

      sidebar: %q({{widget_search}}{{widget_text}}),

      credits: %q(Built with <a href="http://www.makeatheme.com/"
title="Responsive HTML5 and WordPress themes editor" rel="generator">
Make A Theme</a>.)
    }

    TEMPLATES = {
      index: '<div id="main"><div class="row"></div></div>'
    }

    REGIONS = {
      header: '<header id="masthead" role="banner"><div class="row"></div></header>',
      footer: '<footer id="colophon" role="contentinfo"><div class="row"></div></footer>'
    }
  end

  module PHP
    CONTENT = {
      home_url: "<?php echo home_url( '/' ); ?>",
      site_title: "<?php bloginfo( 'name' ); ?>",
      site_description: "<?php bloginfo( 'description' ); ?>",
      search_form: "<?php get_search_form(); ?>"
    }

    BLOCKS = {
      article: %q(
<?php if ( have_posts() ) : ?>
<?php {{theme_slug}}_content_nav( 'nav-above' ); ?>

<?php /* Start the Loop */ ?>
<?php while ( have_posts() ) : the_post(); ?>

  <?php
    /* Include the Post-Format-specific template for the content.
     * If you want to overload this in a child theme then include a file
     * called content-___.php (where ___ is the Post Format name) and that will be used instead.
     */
    get_template_part( 'content', get_post_format() );
  ?>

<?php endwhile; ?>

<?php {{theme_slug}}_content_nav( 'nav-below' ); ?>

<?php elseif ( current_user_can( 'edit_posts' ) ) : ?>

<?php get_template_part( 'no-results', 'index' ); ?>

<?php endif; ?>
),

      "article-single" => %q(
<?php while ( have_posts() ) : the_post(); ?>

  <?php {{theme_slug}}_content_nav( 'nav-above' ); ?>

  <?php get_template_part( 'content', 'single' ); ?>

  <?php {{theme_slug}}_content_nav( 'nav-below' ); ?>

  <?php
    // If comments are open or we have at least one comment, load up the comment template
    if ( comments_open() || '0' != get_comments_number() )
      comments_template( '', true );
  ?>

<?php endwhile; // end of the loop. ?>
),

      "article-page" => %q(
<?php while ( have_posts() ) : the_post(); ?>

  <?php get_template_part( 'content', 'page' ); ?>

  <?php comments_template( '', true ); ?>

<?php endwhile; // end of the loop. ?>
),

      article: %q(
<?php if ( have_posts() ) : ?>

  <?php {{theme_slug}}_content_nav( 'nav-above' ); ?>

  <?php /* Start the Loop */ ?>
  <?php while ( have_posts() ) : the_post(); ?>

    <?php get_template_part( 'content' ); ?>

  <?php endwhile; ?>

  <?php {{theme_slug}}_content_nav( 'nav-below' ); ?>

<?php else : ?>

  <?php get_template_part( 'no-results' ); ?>

<?php endif; ?>
),

      search_form: "<?php get_search_form(); ?>",

      site_title: %q(
<hgroup>
  <h1 class="site-title"><a href="<?php echo home_url( '/' ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
  <h2 class="site-description"><?php bloginfo( 'description' ); ?></h2>
</hgroup>
),

      header_image: %q(
<?php $header_image = get_header_image();
if ( ! empty( $header_image ) ) : ?>
  <img src="<?php echo esc_url( $header_image ); ?>" class="header-image" width="<?php echo get_custom_header()->width; ?>" height="<?php echo get_custom_header()->height; ?>" alt="" />
<?php endif; ?>
),

      navigation: %q(
<nav role="navigation">
  <?php wp_nav_menu( array( 'theme_location' => '<%= block.label.underscore %>' ) ); ?>
</nav>
),

      sidebar: "<?php get_sidebar(<% unless block.label == 'Default' %> '<%= block.label.underscore %>' <% end %>); ?>",

      credits: %q(<?php do_action( '{{theme_slug}}_credits' ); ?>
<a href="http://wordpress.org/" title="<?php esc_attr_e( 'A Semantic Personal Publishing Platform', '{{theme_slug}}' ); ?>" rel="generator"><?php printf( __( 'Proudly powered by %s', '{{theme_slug}}' ), 'WordPress' ); ?></a>
<span class="sep"> | </span>
<?php printf( __( 'Built with %s.', '{{theme_slug}}' ), '<a href="http://www.makeatheme.com/" rel="designer">Make A Theme</a>' ); ?>)
    }

    REGIONS = {
      header: %q(<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<title><?php
  /*
   * Print the <title> tag based on what is being viewed.
   */
  global $page, $paged;

  wp_title( '|', true, 'right' );

  // Add the blog name.
  bloginfo( 'name' );

  // Add the blog description for the home/front page.
  $site_description = get_bloginfo( 'description', 'display' );
  if ( $site_description && ( is_home() || is_front_page() ) )
    echo " | $site_description";

  // Add a page number if necessary:
  if ( $paged >= 2 || $page >= 2 )
    echo ' | ' . sprintf( __( 'Page %s', '{{theme_slug}}' ), max( $paged, $page ) );

  ?></title>
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />

<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<div id="page" class="hfeed site">
  <?php do_action( 'before' ); ?>),

      footer: %q(</div><!-- #page .hfeed .site -->

<?php wp_footer(); ?>

</body>
</html>)
    }

    SIDEBAR = %q(<?php do_action( 'before_sidebar' ); ?>
<?php if ( ! dynamic_sidebar( 'sidebar-{{ block_slug }}' ) ) : ?>

  <aside id="search" class="widget widget_search">
    <?php get_search_form(); ?>
  </aside>

  <aside id="archives" class="widget">
    <h1 class="widget-title"><?php _e( 'Archives', '{{theme_slug}}' ); ?></h1>
    <ul>
      <?php wp_get_archives( array( 'type' => 'monthly' ) ); ?>
    </ul>
  </aside>

  <aside id="meta" class="widget">
    <h1 class="widget-title"><?php _e( 'Meta', '{{theme_slug}}' ); ?></h1>
    <ul>
      <?php wp_register(); ?>
      <li><?php wp_loginout(); ?></li>
      <?php wp_meta(); ?>
    </ul>
  </aside>

<?php endif; ?>)
  end

  module WP
    TEMPLATES = %w(home front-page image video audio text plain text_plain
                   attachment single-attachment single page category tag
                   taxonomy author date archive search 404 index)
  end
end
