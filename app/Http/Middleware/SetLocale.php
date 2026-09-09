<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const SUPPORTED = ['en', 'hi', 'mr', 'ta', 'te'];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->query('ref')) {
            $request->session()->put('referral_code', $request->query('ref'));
        }

        $locale = $request->query('lang')
            ?? $request->user()?->locale
            ?? $request->session()->get('locale')
            ?? $request->getPreferredLanguage(self::SUPPORTED)
            ?? config('app.locale', 'en');

        if (! in_array($locale, self::SUPPORTED, true)) {
            $locale = 'en';
        }

        App::setLocale($locale);

        return $next($request);
    }
}
