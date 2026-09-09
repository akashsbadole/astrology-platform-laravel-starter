<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    protected $fillable = ['user_id', 'assignee_id', 'subject', 'body', 'priority', 'status'];
}
