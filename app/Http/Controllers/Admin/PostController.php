<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(): Response|JsonResponse
    {
        $posts = Post::with('author:id,name')->latest()->paginate(15);

        if (request()->wantsJson()) {
            return response()->json([
                'data' => $posts->items(),
                'total' => $posts->total(),
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
            ]);
        }

        return Inertia::render('admin/posts/index', ['posts' => $posts]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/posts/form', ['post' => null]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string', 'min:10'],
            'status' => ['required', 'in:draft,published'],
        ]);

        $post = $request->user()->posts()->create([
            ...$validated,
            'slug' => Post::makeSlug($validated['title']),
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'post' => $post]);
        }

        return redirect()->route('admin.posts.index')->with('status', 'Post created: '.$post->title);
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('admin/posts/form', ['post' => $post]);
    }

    public function show(Post $post): JsonResponse
    {
        return response()->json(['post' => $post]);
    }

    public function update(Request $request, Post $post): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string', 'min:10'],
            'status' => ['required', 'in:draft,published'],
        ]);

        $post->update([
            ...$validated,
            'published_at' => $validated['status'] === 'published'
                ? ($post->published_at ?? now())
                : null,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'post' => $post]);
        }

        return redirect()->route('admin.posts.index')->with('status', 'Post updated.');
    }

    public function destroy(Post $post): RedirectResponse|JsonResponse
    {
        $post->delete();

        if (request()->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('status', 'Post deleted.');
    }
}
