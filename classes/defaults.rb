module Defaults
  module HTML
    # Sample content for theme preview
    CONTENT = {
      site_title: 'Theme Preview',
      site_description: 'Just another WordPress site'
    }

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

      article: %q(<article class="page hentry">
  <header class="entry-header">
    <h1 class="entry-title">Sample Page</h1>
  </header><!-- .entry-header -->
  <div class="entry-content">
    <p>This is an example page. It's different from a blog post because
    it will stay in one place and will show up in your site navigation
    (in most themes). Most people start with an About page that introduces them
    to potential site visitors. It might say something like this:</p>
    <blockquote><p>Hi there! I'm a bike messenger by day, aspiring actor by night,
      and this is my blog. I live in Los Angeles, have a great dog named Jack,
      and I like pi&#241;a coladas. (And gettin' caught in the rain.)</p></blockquote>
    <p>...or something like this:</p>
    <blockquote><p>The XYZ Doohickey Company was founded in 1971, and has been providing
      quality doohickies to the public ever since. Located in Gotham City,
      XYZ employs over 2,000 people and does all kinds of awesome things for
      the Gotham community.</p></blockquote>
    <p>As a new WordPress user, you should go to <a href="#">your dashboard</a>
    to delete this page and create new pages for your content. Have fun!</p>
  </div><!-- .entry-content -->
  <footer class="entry-meta">
  </footer><!-- .entry-meta -->
</article>),

      sidebar: %q(<aside class="widget widget_search">
  <form method="get" id="searchform" action="http://localhost.dev/~sorich87/wordpress/">
    <label for="s" class="assistive-text">Search</label>
    <input type="text" class="field" name="s" id="s" placeholder="Search" />
    <input type="submit" class="submit" name="submit" id="searchsubmit" value="Search" />
  </form>
</aside>
<aside id="recent-posts-2" class="widget widget_recent_entries">
  <h3 class="widget-title">Recent Posts</h3>
  <ul>
    <li><a href="http://localhost.dev/~sorich87/wordpress/2012/05/hello-world/" title="Hello world!">Hello world!</a></li>
  </ul>
</aside>
<aside class="widget widget_recent_comments">
  <h3 class="widget-title">Recent Comments</h3>
  <ul id="recentcomments">
    <li class="recentcomments"><a href='http://wordpress.org/' rel='external nofollow' class='url'>Mr WordPress</a> on <a href="http://localhost.dev/~sorich87/wordpress/2012/05/hello-world/#comment-1">Hello world!</a></li></ul></aside><aside id="archives-2" class="widget widget_archive"><h3 class="widget-title">Archives</h3>		<ul>
    <li><a href='http://localhost.dev/~sorich87/wordpress/2012/05/' title='May 2012'>May 2012</a></li>
  </ul>
</aside>
<aside class="widget widget_categories">
  <h3 class="widget-title">Categories</h3>
  <ul>
    <li class="cat-item cat-item-1"><a href="http://localhost.dev/~sorich87/wordpress/category/uncategorized/" title="View all posts filed under Uncategorized">Uncategorized</a>
    </li>
  </ul>
</aside>
<aside class="widget widget_meta">
  <h3 class="widget-title">Meta</h3>
  <ul>
    <li><a href="http://localhost.dev/~sorich87/wordpress/wp-admin/">Site Admin</a></li>			<li><a href="http://localhost.dev/~sorich87/wordpress/wp-login.php?action=logout&#038;_wpnonce=ddb0c652c9">Log out</a></li>
    <li><a href="http://localhost.dev/~sorich87/wordpress/feed/" title="Syndicate this site using RSS 2.0">Entries <abbr title="Really Simple Syndication">RSS</abbr></a></li>
    <li><a href="http://localhost.dev/~sorich87/wordpress/comments/feed/" title="The latest comments to all posts in RSS">Comments <abbr title="Really Simple Syndication">RSS</abbr></a></li>
    <li><a href="http://wordpress.org/" title="Powered by WordPress, state-of-the-art semantic personal publishing platform.">WordPress.org</a></li>
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

      search_form: %q(<form method="get" id="searchform" action="<?php echo esc_url( home_url( '/' ) ); ?>" role="search">
  <label for="s" class="assistive-text"><?php _e( 'Search', '_s' ); ?></label>
  <input type="text" class="field" name="s" id="s" placeholder="<?php esc_attr_e( 'Search &hellip;', '_s' ); ?>" />
  <input type="submit" class="submit" name="submit" id="searchsubmit" value="<?php esc_attr_e( 'Search', '_s' ); ?>" />
</form>),

      header_image: %q(<?php $header_image = get_header_image();
if ( ! empty( $header_image ) ) : ?>
  <img src="<?php echo esc_url( $header_image ); ?>" class="header-image" width="<?php echo get_custom_header()->width; ?>" height="<?php echo get_custom_header()->height; ?>" alt="" />
<?php endif; ?>),

      navigation: %q(<nav role="navigation">
  <?php wp_nav_menu( array( 'theme_location' => 'primary' ) ); ?>
</nav>),

      sidebar: "<?php get_sidebar(); ?>"
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
end
