<?php
if (!defined('ABSPATH')) { exit; }

function creava_save_order(array $payload): int {
    return wp_insert_post([
        'post_type' => 'creava_order',
        'post_status' => 'publish',
        'post_title' => sprintf('order_%s', sanitize_text_field($payload['stripe_session_id'] ?? 'unknown')),
        'meta_input' => $payload,
    ]);
}
