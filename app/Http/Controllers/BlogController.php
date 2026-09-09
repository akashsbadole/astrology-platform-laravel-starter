<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $posts = Post::published()
            ->with('author:id,name')
            ->latest('published_at')
            ->paginate(9)
            ->through(fn (Post $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title' => $p->title,
                'excerpt' => $p->excerpt,
                'published_at' => $p->published_at?->toDateString(),
                'author_name' => $p->author->name,
            ]);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $posts->items(),
                'total' => $posts->total(),
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
            ]);
        }

        return Inertia::render('blog/index', ['posts' => $posts]);
    }

    public function show(string $slug): Response|JsonResponse
    {
        $post = Post::published()->where('slug', $slug)->with('author:id,name')->firstOrFail();

        $payload = [
            'post' => [
                'id' => $post->id,
                'slug' => $post->slug,
                'title' => $post->title,
                'excerpt' => $post->excerpt,
                'body' => $post->body,
                'published_at' => $post->published_at?->toDateString(),
                'author_name' => $post->author->name,
            ],
        ];

        if (request()->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('blog/show', $payload);
    }
}
