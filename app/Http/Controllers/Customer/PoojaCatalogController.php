<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Pooja;
use Inertia\Inertia;
use Inertia\Response;

class PoojaCatalogController extends Controller
{
    public function index(): Response
    {
        $poojas = Pooja::query()
            ->active()
            ->orderBy('category')
            ->orderBy('name')
            ->get(['id', 'name', 'category', 'description', 'duration_minutes', 'price', 'is_online']);

        return Inertia::render('customer/poojas/index', [
            'poojas' => $poojas,
        ]);
    }

    public function show(Pooja $pooja): Response
    {
        abort_unless($pooja->is_active, 404);

        return Inertia::render('customer/poojas/show', [
            'pooja' => $pooja,
        ]);
    }
}
