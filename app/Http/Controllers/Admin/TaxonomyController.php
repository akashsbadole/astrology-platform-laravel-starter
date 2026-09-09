<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Taxonomy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaxonomyController extends Controller
{
    public function index(): Response|JsonResponse
    {
        $payload = [
            'specializations' => Taxonomy::query()->ofType('specialization')->orderBy('name')->get(['id', 'name', 'is_active']),
            'languages' => Taxonomy::query()->ofType('language')->orderBy('name')->get(['id', 'name', 'is_active']),
        ];

        if (request()->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('admin/taxonomies/index', $payload);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['specialization', 'language'])],
            'name' => ['required', 'string', 'max:100'],
        ]);

        $taxonomy = Taxonomy::query()->firstOrCreate(
            ['type' => $validated['type'], 'name' => $validated['name']],
            ['is_active' => true],
        );

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'taxonomy' => $taxonomy]);
        }

        return back()->with('status', 'taxonomy-added');
    }

    public function update(Request $request, Taxonomy $taxonomy): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $taxonomy->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('status', 'taxonomy-updated');
    }

    public function destroy(Taxonomy $taxonomy): RedirectResponse|JsonResponse
    {
        $taxonomy->delete();

        if (request()->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('status', 'taxonomy-deleted');
    }
}
