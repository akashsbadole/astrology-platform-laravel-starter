<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'razorpay' => [
        'key_id' => env('RAZORPAY_KEY_ID'),
        'key_secret' => env('RAZORPAY_KEY_SECRET'),
        'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET'),
    ],

    'call' => [
        'provider' => env('CALL_PROVIDER', 'reverb'),
        'agora_app_id' => env('AGORA_APP_ID'),
        'agora_cert' => env('AGORA_CERT'),
        'turn_urls' => env('TURN_URLS') ? explode(',', (string) env('TURN_URLS')) : [],
        'turn_username' => env('TURN_USERNAME'),
        'turn_credential' => env('TURN_CREDENTIAL'),
    ],

    'consult' => [
        'commission_rate' => (float) env('CONSULT_COMMISSION_RATE', 0.25),
        'min_start_minutes' => (int) env('WALLET_MIN_START_MINUTES', 5),
        'tick_seconds' => (int) env('RATE_TICK_SECONDS', 30),
        'low_balance_minutes' => (float) env('LOW_BALANCE_MINUTES', 2),
    ],

    'fcm' => [
        'server_key' => env('FCM_SERVER_KEY'),
    ],

    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
        'twilio_sid' => env('TWILIO_SID'),
        'twilio_token' => env('TWILIO_TOKEN'),
        'twilio_from' => env('TWILIO_FROM'),
        'msg91_key' => env('MSG91_AUTH_KEY'),
        'msg91_sender' => env('MSG91_SENDER', 'ASTRO'),
        'msg91_flow' => env('MSG91_FLOW_ID'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', env('APP_URL').'/auth/google/callback'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URI', env('APP_URL').'/auth/facebook/callback'),
    ],

];
