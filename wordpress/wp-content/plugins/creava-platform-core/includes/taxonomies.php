<?php
if (!defined('ABSPATH')) { exit; }

function creava_register_taxonomies(): void {
    register_taxonomy('content_category', ['blog', 'news', 'fanclub_content'], ['label' => 'コンテンツカテゴリ', 'show_in_rest' => true, 'public' => true]);
    register_taxonomy('content_tag', ['blog', 'news', 'fanclub_content'], ['label' => 'コンテンツタグ', 'show_in_rest' => true, 'public' => true]);
    register_taxonomy('product_category', ['store_product'], ['label' => '商品カテゴリ', 'show_in_rest' => true, 'public' => true]);
    register_taxonomy('product_tag', ['store_product'], ['label' => '商品タグ', 'show_in_rest' => true, 'public' => true]);
    register_taxonomy('event_category', ['event'], ['label' => 'イベントカテゴリ', 'show_in_rest' => true, 'public' => true]);
    register_taxonomy('work_category', ['work'], ['label' => '作品カテゴリ', 'show_in_rest' => true, 'public' => true]);
}
add_action('init', 'creava_register_taxonomies');
