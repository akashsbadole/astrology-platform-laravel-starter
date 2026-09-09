<?php

namespace App\Http\Controllers;

use App\Models\ForumCategory;
use App\Models\ForumPost;
use App\Models\ForumThread;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ForumController extends Controller
{
    public function index(): Response
    {
        $categories = ForumCategory::withCount('threads')->orderBy('name')->get();
        $threads = ForumThread::with(['author:id,name', 'category:id,name'])
            ->orderByDesc('is_pinned')
            ->latest('last_reply_at')
            ->latest()
            ->paginate(15)
            ->through(fn (ForumThread $t) => $this->presentThread($t));

        return Inertia::render('forum/index', [
            'categories' => $categories,
            'threads' => $threads,
        ]);
    }

    public function showCategory(string $slug): Response
    {
        $category = ForumCategory::where('slug', $slug)->firstOrFail();
        $threads = ForumThread::where('category_id', $category->id)
            ->with(['author:id,name'])
            ->orderByDesc('is_pinned')
            ->latest('last_reply_at')
            ->paginate(15)
            ->through(fn (ForumThread $t) => $this->presentThread($t));

        return Inertia::render('forum/category', [
            'category' => $category,
            'threads' => $threads,
        ]);
    }

    public function showThread(ForumThread $thread): Response
    {
        $thread->load(['author:id,name', 'category:id,name,slug']);
        $posts = $thread->posts()->with('author:id,name')->oldest()->paginate(20);

        return Inertia::render('forum/thread', [
            'thread' => [...$this->presentThread($thread), 'body' => $thread->body],
            'posts' => $posts,
            'canReply' => ! $thread->is_locked,
        ]);
    }

    public function storeThread(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:forum_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'min:10', 'max:10000'],
        ]);

        $thread = ForumThread::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'last_reply_at' => now(),
        ]);

        return redirect()->route('forum.threads.show', $thread)->with('status', 'Thread created.');
    }

    public function storeReply(Request $request, ForumThread $thread): RedirectResponse
    {
        abort_if($thread->is_locked, 422, 'This thread is locked.');

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:2', 'max:5000'],
        ]);

        ForumPost::create([
            'thread_id' => $thread->id,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $thread->update([
            'replies_count' => $thread->posts()->count(),
            'last_reply_at' => now(),
        ]);

        return back()->with('status', 'Reply posted.');
    }

    public function moderate(Request $request, ForumThread $thread): RedirectResponse
    {
        abort_unless($request->user()->role->value === 'admin', 403);

        $validated = $request->validate([
            'action' => ['required', 'in:pin,unpin,lock,unlock,delete'],
        ]);

        match ($validated['action']) {
            'pin' => $thread->update(['is_pinned' => true]),
            'unpin' => $thread->update(['is_pinned' => false]),
            'lock' => $thread->update(['is_locked' => true]),
            'unlock' => $thread->update(['is_locked' => false]),
            'delete' => $thread->delete(),
        };

        return back()->with('status', 'Thread '.$validated['action'].'d.');
    }

    private function presentThread(ForumThread $thread): array
    {
        return [
            'id' => $thread->id,
            'title' => $thread->title,
            'author_name' => $thread->author->name ?? '—',
            'category_name' => $thread->category->name ?? null,
            'category_id' => $thread->category_id,
            'is_pinned' => (bool) $thread->is_pinned,
            'is_locked' => (bool) $thread->is_locked,
            'replies_count' => $thread->replies_count,
            'last_reply_at' => $thread->last_reply_at?->toIso8601String(),
            'created_at' => $thread->created_at->toIso8601String(),
        ];
    }
}
