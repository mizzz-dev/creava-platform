<?php
if (!defined('ABSPATH')) { exit; }

function creava_register_meta_fields(): void {
    $post_types = ['blog', 'news', 'event', 'work', 'store_product', 'fanclub_content'];
    foreach ($post_types as $post_type) {
        register_post_meta($post_type, 'access_status', ['show_in_rest' => true, 'single' => true, 'type' => 'string', 'default' => 'public']);
        register_post_meta($post_type, 'stripe_price_id', ['show_in_rest' => false, 'single' => true, 'type' => 'string']);
        register_post_meta($post_type, 'seo_title', ['show_in_rest' => true, 'single' => true, 'type' => 'string']);
    }
}
add_action('init', 'creava_register_meta_fields');
