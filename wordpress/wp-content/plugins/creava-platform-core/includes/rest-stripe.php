<?php
if (!defined('ABSPATH')) { exit; }

function creava_register_stripe_routes(): void {
    register_rest_route('creava/v1', '/checkout/session', [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'creava_create_checkout_session',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('creava/v1', '/billing/portal', [
        'methods' => WP_REST_Server::CREATABLE,
        'callback' => 'creava_create_billing_portal_session',
        'permission_callback' => function () { return is_user_logged_in(); },
    ]);
}

function creava_create_checkout_session(WP_REST_Request $request) {
    // TODO: Stripe SDK で Checkout Session を生成
    return rest_ensure_response(['url' => null, 'message' => 'not_implemented']);
}

function creava_create_billing_portal_session(WP_REST_Request $request) {
    // TODO: Stripe SDK で Customer Portal Session を生成
    return rest_ensure_response(['url' => null, 'message' => 'not_implemented']);
}
