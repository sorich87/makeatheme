require 'handlebars'

module CustomizationConstants
  def self.proc_safe_string(str)
    proc { Handlebars::SafeString.new(str) }
  end

  CONSTANTS = {}

  CONSTANTS[:content] = %Q(
        <?php if ( have_posts() ) : ?>
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

        <?php endif; ?>)

  CONSTANTS[:home_url] = proc_safe_string("<?php echo home_url( '/' ); ?>")
  CONSTANTS[:site_title] = proc_safe_string("<?php bloginfo( 'name' ); ?>")
  CONSTANTS[:site_description] = proc_safe_string("<?php bloginfo( 'description' ); ?>")

  CONSTANTS[:search_form] = proc_safe_string(%Q(
      <form method="get" id="searchform" action="<?php echo esc_url( home_url( '/' ) ); ?>" role="search">
        <label for="s" class="assistive-text"><?php _e( 'Search', '_s' ); ?></label>
        <input type="text" class="field" name="s" id="s" placeholder="<?php esc_attr_e( 'Search &hellip;', '_s' ); ?>" />
        <input type="submit" class="submit" name="submit" id="searchsubmit" value="<?php esc_attr_e( 'Search', '_s' ); ?>" />
      </form>
  ))

  CONSTANTS[:header_image] = proc_safe_string(
      %Q(<?php $header_image = get_header_image();
      if ( ! empty( $header_image ) ) : ?>
        <img src="<?php echo esc_url( $header_image ); ?>" class="header-image" width="<?php echo get_custom_header()->width; ?>" height="<?php echo get_custom_header()->height; ?>" alt="" />
      <?php endif; ?>
  ))

  CONSTANTS[:menu] = 'Menu'
end