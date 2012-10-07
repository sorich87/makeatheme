module Defaults
  module HTML
    def self.locals(theme)
      {
        site_title: 'Theme Preview',
        site_description: 'Just another beautiful theme',
        header_image_url: theme.header_images.first.file.url
      }
    end

    @entry_content = %q(<p>Lorem ipsum dolor sit amet, adipiscing elit. Nullam dignissim
convallis est. Quisque aliquam. Donec faucibus. Nunc iaculis suscipit dui. Nam
sit amet sem. Aliquam libero nisi, imperdiet at, tincidunt nec, gravida
vehicula, nisl. Praesent mattis, massa quis luctus fermentum, turpis mi
volutpat justo, eu volutpat enim diam eget metus. Maecenas ornare tortor. Donec
sed tellus eget sapien fringilla nonummy. Mauris a ante. Suspendisse quam sem,
consequat at, commodo vitae, feugiat in, nunc. Morbi imperdiet augue quis tellus.</p>
<p>Lorem ipsum dolor sit amet, <em>emphasis</em> consectetuer adipiscing elit.
Nullam dignissim convallis est. Quisque aliquam. Donec faucibus. Nunc iaculis
suscipit dui. Nam sit amet sem. Aliquam libero nisi, imperdiet at, tincidunt
nec, gravida vehicula, nisl. Praesent mattis, massa quis luctus fermentum,
turpis mi volutpat justo, eu volutpat enim diam eget metus. Maecenas ornare
tortor. Donec sed tellus eget sapien fringilla nonummy. Mauris a ante.
Suspendisse quam sem, consequat at, commodo vitae, feugiat in, nunc. Morbi
imperdiet augue quis tellus.</p>)

    BLOCKS = {
      header_image: %q(<a href="{{site_url}}">
  <img src='{{ header_image_url }}' width='1000' height='288' alt='' />
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

      search_form: %q(<form method="get" id="searchform" action="{{home_url}}" role="search">
  <label for="s" class="assistive-text">Search</label>
  <input type="text" class="field" name="s" id="s" placeholder="Search &hellip;" />
  <input type="submit" class="submit" name="submit" id="searchsubmit" value="Search" />
</form>),

      article: %Q(<article class="page hentry">
  <header class="entry-header">
    <h1 class="entry-title">Sample Content</h1>
  </header><!-- .entry-header -->
  <div class="entry-content">
    #{@entry_content}
  </div><!-- .entry-content -->
  <footer class="entry-meta">
  </footer><!-- .entry-meta -->
</article>),

      "article-single" => %Q(<article class="page hentry">
  <header class="entry-header">
    <h1 class="entry-title">Sample Content</h1>
  </header><!-- .entry-header -->
  <div class="entry-content">
    #{@entry_content}
  </div><!-- .entry-content -->
  <footer class="entry-meta">
  </footer><!-- .entry-meta -->
</article>),

      "article-page" => %Q(<article class="page hentry">
  <header class="entry-header">
    <h1 class="entry-title">Sample Content</h1>
  </header><!-- .entry-header -->
  <div class="entry-content">
    #{@entry_content}
  </div><!-- .entry-content -->
  <footer class="entry-meta">
  </footer><!-- .entry-meta -->
</article>),

      sidebar: %q(<aside class="widget widget_search">
  <form method="get" id="searchform">
    <label for="s" class="assistive-text">Search</label>
    <input type="text" class="field" name="s" id="s" placeholder="Search" />
    <input type="submit" class="submit" name="submit" id="searchsubmit" value="Search" />
  </form>
</aside>
<aside class="widget widget_text">
  <h3 class="widget-title">Some Title</h3>
  <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam dignissim
  convallis est.</p>
  <ul>
    <li>List Item 1</li>
    <li>List Item 2</li>
    <li>List Item 3</li>
  </ul>
</aside>)
    }
  end

  module PHP
    CONTENT = {
      home_url: "<?php echo home_url( '/' ); ?>",
      site_title: "<?php bloginfo( 'name' ); ?>",
      site_description: "<?php bloginfo( 'description' ); ?>",

      article: %q(<?php if ( have_posts() ) : ?>
<?php _s_content_nav( 'nav-above' ); ?>

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

<?php _s_content_nav( 'nav-below' ); ?>

<?php elseif ( current_user_can( 'edit_posts' ) ) : ?>

<?php get_template_part( 'no-results', 'index' ); ?>

<?php endif; ?>),

      "article-single" => %q(<?php while ( have_posts() ) : the_post(); ?>

  <?php _s_content_nav( 'nav-above' ); ?>

  <?php get_template_part( 'content', 'single' ); ?>

  <?php _s_content_nav( 'nav-below' ); ?>

  <?php
    // If comments are open or we have at least one comment, load up the comment template
    if ( comments_open() || '0' != get_comments_number() )
      comments_template( '', true );
  ?>

<?php endwhile; // end of the loop. ?>),

      "article-page" => %q(<?php while ( have_posts() ) : the_post(); ?>

  <?php get_template_part( 'content', 'page' ); ?>

  <?php comments_template( '', true ); ?>

<?php endwhile; // end of the loop. ?>),

      article: %q(<?php if ( have_posts() ) : ?>

  <?php _s_content_nav( 'nav-above' ); ?>

  <?php /* Start the Loop */ ?>
  <?php while ( have_posts() ) : the_post(); ?>

    <?php get_template_part( 'content' ); ?>

  <?php endwhile; ?>

  <?php _s_content_nav( 'nav-below' ); ?>

<?php else : ?>

  <?php get_template_part( 'no-results' ); ?>

<?php endif; ?>),

      search_form: %q(<?php get_search_form(); ?>),

      header_image: %q(<?php $header_image = get_header_image();
if ( ! empty( $header_image ) ) : ?>
  <img src="<?php echo esc_url( $header_image ); ?>" class="header-image" width="<?php echo get_custom_header()->width; ?>" height="<?php echo get_custom_header()->height; ?>" alt="" />
<?php endif; ?>),

      navigation: %q(<nav role="navigation">
  <?php wp_nav_menu( array( 'theme_location' => '<%= block.label.underscore %>' ) ); ?>
</nav>),

      sidebar: "<?php get_sidebar(<% unless block.label == 'Default' %> '<%= block.label.underscore %>' <% end %>); ?>"
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
    echo ' | ' . sprintf( __( 'Page %s', '_s' ), max( $paged, $page ) );

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
  end

  module WP
    TEMPLATES = %w(home front-page image video audio text plain text_plain
                   attachment single-attachment single page category tag
                   taxonomy author date archive search 404 index)
  end
end
