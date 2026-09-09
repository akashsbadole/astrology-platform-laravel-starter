<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
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

        return Inertia::render('blog/index', ['posts' => $posts]);
    }

    public function show(string $slug): Response
    {
        $post = Post::published()->where('slug', $slug)->with('author:id,name')->firstOrFail();

        return Inertia::render('blog/show', [
            'post' => [
                'id' => $post->id,
                'slug' => $post->slug,
                'title' => $post->title,
                'excerpt' => $post->excerpt,
                'body' => $post->body,
                'published_at' => $post->published_at?->toDateString(),
                'author_name' => $post->author->name,
            ],
        ]);
    }
}
