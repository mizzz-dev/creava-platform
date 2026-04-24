<?php
if (!defined('ABSPATH')) { exit; }

function creava_register_post_types(): void {
    $types = [
        'blog' => 'ブログ',
        'news' => 'ニュース',
        'event' => 'イベント',
        'work' => '作品',
        'store_product' => '商品',
        'fanclub_content' => 'ファンクラブ',
        'creava_order' => '注文',
        'creava_subscription' => 'サブスクリプション',
        'creava_entitlement' => '権利',
        'creava_customer' => '顧客',
    ];

    foreach ($types as $slug => $label) {
        register_post_type($slug, [
            'label' => $label,
            'public' => !str_starts_with($slug, 'creava_'),
            'show_in_rest' => true,
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'map_meta_cap' => true,
        ]);
    }
}
add_action('init', 'creava_register_post_types');
