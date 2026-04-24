<?php
if (!defined('ABSPATH')) { exit; }

function creava_can_view_post(int $post_id, ?int $user_id = null): bool {
    $access = get_post_meta($post_id, 'access_status', true) ?: 'public';
    if ($access === 'public') {
        return true;
    }

    if (!$user_id) {
        $user_id = get_current_user_id();
    }

    if (!$user_id) {
        return false;
    }

    // TODO: entitlement 判定を実装
    return $access === 'members_only';
}
