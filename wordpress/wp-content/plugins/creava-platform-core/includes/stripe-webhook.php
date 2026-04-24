<?php
if (!defined('ABSPATH')) { exit; }

function creava_handle_stripe_webhook(WP_REST_Request $request) {
    $signature = $request->get_header('stripe-signature');
    $payload = $request->get_body();
    $secret = getenv('STRIPE_WEBHOOK_SECRET') ?: '';

    if (empty($signature) || empty($secret)) {
        return new WP_REST_Response(['error' => 'invalid_signature'], 400);
    }

    // TODO: Stripe\Webhook::constructEvent() で署名検証を実装
    $event = json_decode($payload, true);
    if (!is_array($event) || empty($event['type'])) {
        return new WP_REST_Response(['error' => 'invalid_payload'], 400);
    }

    return new WP_REST_Response(['received' => true], 200);
}
