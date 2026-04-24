<?php
if (!defined('ABSPATH')) { exit; }

function creava_save_entitlement(array $payload): int {
    return wp_insert_post([
        'post_type' => 'creava_entitlement',
        'post_status' => 'publish',
        'post_title' => sprintf('entitlement_%s', sanitize_text_field($payload['stripe_customer_id'] ?? 'unknown')),
        'meta_input' => $payload,
    ]);
}
