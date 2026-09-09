<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Kundli;
use App\Services\KundliMatchingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MilanController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('milan/index', [
            'kundlis' => $request->user()->kundlis()->latest()->get(['id', 'profile_name']),
        ]);
    }

    public function match(Request $request, KundliMatchingService $svc): Response
    {
        $v = $request->validate(['a_id' => 'required|exists:kundlis,id', 'b_id' => 'required|exists:kundlis,id']);
        $a = Kundli::findOrFail($v['a_id']);
        $b = Kundli::findOrFail($v['b_id']);
        abort_unless($a->user_id === $request->user()->id && $b->user_id === $request->user()->id, 403);
        $result = $svc->match($a, $b);

        return Inertia::render('milan/result', [
            'a' => ['id' => $a->id, 'name' => $a->profile_name],
            'b' => ['id' => $b->id, 'name' => $b->profile_name],
            'result' => $result,
        ]);
    }
}
