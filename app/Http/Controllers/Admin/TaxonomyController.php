<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Taxonomy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaxonomyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/taxonomies/index', [
            'specializations' => Taxonomy::query()->ofType('specialization')->orderBy('name')->get(['id', 'name', 'is_active']),
            'languages' => Taxonomy::query()->ofType('language')->orderBy('name')->get(['id', 'name', 'is_active']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['specialization', 'language'])],
            'name' => ['required', 'string', 'max:100'],
        ]);

        Taxonomy::query()->firstOrCreate(
            ['type' => $validated['type'], 'name' => $validated['name']],
            ['is_active' => true],
        );

        return back()->with('status', 'taxonomy-added');
    }

    public function update(Request $request, Taxonomy $taxonomy): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $taxonomy->update($validated);

        return back()->with('status', 'taxonomy-updated');
    }

    public function destroy(Taxonomy $taxonomy): RedirectResponse
    {
        $taxonomy->delete();

        return back()->with('status', 'taxonomy-deleted');
    }
}
