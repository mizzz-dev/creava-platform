<?php
if (!defined('ABSPATH')) { exit; }

function creava_save_subscription(array $payload): int {
    return wp_insert_post([
        'post_type' => 'creava_subscription',
        'post_status' => 'publish',
        'post_title' => sprintf('sub_%s', sanitize_text_field($payload['stripe_subscription_id'] ?? 'unknown')),
        'meta_input' => $payload,
    ]);
}
