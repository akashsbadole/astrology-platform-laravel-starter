<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pooja;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PoojaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/poojas/index', [
            'poojas' => Pooja::query()->orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/poojas/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        Pooja::create($validated);

        return redirect()->route('admin.poojas.index');
    }

    public function edit(Pooja $pooja): Response
    {
        return Inertia::render('admin/poojas/edit', ['pooja' => $pooja]);
    }

    public function update(Request $request, Pooja $pooja): RedirectResponse
    {
        $validated = $this->validated($request);

        $pooja->update($validated);

        return redirect()->route('admin.poojas.index');
    }

    public function destroy(Pooja $pooja): RedirectResponse
    {
        $pooja->delete();

        return back()->with('status', 'pooja-deleted');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'category' => ['required', Rule::in(['daily', 'weekly', 'monthly', 'special_occasion'])],
            'description' => ['nullable', 'string', 'max:2000'],
            'benefits' => ['nullable', 'string', 'max:2000'],
            'vidhi' => ['nullable', 'string', 'max:4000'],
            'samagri' => ['nullable', 'array'],
            'samagri.*' => ['string', 'max:150'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:600'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'is_online' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ]);

        return $validated;
    }
}
