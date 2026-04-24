<?php
if (!defined('ABSPATH')) { exit; }

function creava_content_response(array $posts, int $page, int $page_size, int $total): array {
    return [
        'data' => $posts,
        'meta' => [
            'page' => $page,
            'pageSize' => $page_size,
            'pageCount' => (int) ceil($total / max($page_size, 1)),
            'total' => $total,
        ],
    ];
}

function creava_register_content_routes(): void {
    $routes = [
        'blog' => 'blog',
        'news' => 'news',
        'events' => 'event',
        'works' => 'work',
        'store-products' => 'store_product',
        'fanclub-contents' => 'fanclub_content',
    ];

    foreach ($routes as $route => $post_type) {
        register_rest_route('creava/v1', '/' . $route, [
            'methods' => WP_REST_Server::READABLE,
            'callback' => function (WP_REST_Request $request) use ($post_type) {
                $page = max((int) $request->get_param('page'), 1);
                $page_size = max((int) $request->get_param('pageSize'), 1) ?: 12;
                $slug = sanitize_text_field((string) $request->get_param('slug'));

                $query_args = [
                    'post_type' => $post_type,
                    'post_status' => 'publish',
                    'paged' => $page,
                    'posts_per_page' => $page_size,
                ];

                if (!empty($slug)) {
                    $query_args['name'] = $slug;
                    $query_args['posts_per_page'] = 1;
                }

                $query = new WP_Query($query_args);
                $items = array_map(function (WP_Post $post) {
                    return [
                        'id' => $post->ID,
                        'slug' => $post->post_name,
                        'title' => get_the_title($post),
                        'body' => apply_filters('the_content', $post->post_content),
                        'excerpt' => get_the_excerpt($post),
                        'publishedAt' => get_post_time('c', true, $post),
                        'updatedAt' => get_post_modified_time('c', true, $post),
                        'accessStatus' => get_post_meta($post->ID, 'access_status', true) ?: 'public',
                    ];
                }, $query->posts);

                return rest_ensure_response(creava_content_response($items, $page, $page_size, (int) $query->found_posts));
            },
            'permission_callback' => '__return_true',
        ]);
    }

    register_rest_route('creava/v1', '/site-settings', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => function () {
            return rest_ensure_response(['data' => [
                'siteName' => get_bloginfo('name'),
                'description' => get_bloginfo('description'),
            ]]);
        },
        'permission_callback' => '__return_true',
    ]);
}
