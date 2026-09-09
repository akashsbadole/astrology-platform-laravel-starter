<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()->notifications()
            ->latest()
            ->paginate(20)
            ->through(fn ($n) => [
                'id' => $n->id,
                'type' => class_basename($n->type),
                'data' => $n->data,
                'read_at' => $n->read_at?->toIso8601String(),
                'created_at' => $n->created_at->toIso8601String(),
            ]);

        $prefs = $request->user()->notificationPreference
            ?? $request->user()->notificationPreference()->create([]);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $request->user()->unreadNotifications()->count(),
            'preferences' => [
                'email_enabled' => (bool) $prefs->email_enabled,
                'sms_enabled' => (bool) $prefs->sms_enabled,
                'push_enabled' => (bool) $prefs->push_enabled,
            ],
        ]);
    }

    public function read(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        $url = $notification->data['url'] ?? '/notifications';

        return redirect($url);
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }

    public function updatePreferences(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email_enabled' => ['required', 'boolean'],
            'sms_enabled' => ['required', 'boolean'],
            'push_enabled' => ['required', 'boolean'],
        ]);

        $request->user()->notificationPreference()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return back()->with('status', 'preferences-updated');
    }

    public function storeToken(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:512'],
            'platform' => ['nullable', 'string', 'max:30'],
        ]);

        $request->user()->deviceTokens()->updateOrCreate(
            ['token' => $validated['token']],
            ['platform' => $validated['platform'] ?? 'web']
        );

        return back();
    }
}
