<?php

use App\Models\Booking;
use App\Models\Consultation;
use App\Models\PoojaBooking;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('booking.{bookingId}', function ($user, $bookingId) {
    $booking = Booking::find($bookingId);

    if (! $booking) {
        return false;
    }

    return $user->id === $booking->customer_id || $user->id === $booking->astrologer_id;
});

Broadcast::channel('pooja-booking.{poojaBookingId}', function ($user, $poojaBookingId) {
    $booking = PoojaBooking::find($poojaBookingId);

    if (! $booking) {
        return false;
    }

    return $user->id === $booking->customer_id || $user->role->value === 'admin';
});

Broadcast::channel('consultation.{consultationId}', function ($user, $consultationId) {
    $c = Consultation::find($consultationId);

    if (! $c) {
        return false;
    }

    return in_array($user->id, [$c->customer_id, $c->astrologer_id], true);
});

Broadcast::channel('live.{liveId}', function ($user, $liveId) {
    return (bool) $user;
});
