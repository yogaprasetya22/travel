<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'no_hp' => ['nullable', 'string', 'max:30'],
            'kota' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'landing_links' => ['nullable', 'array'],
            'landing_links.*.title' => ['required_with:landing_links', 'string', 'max:100'],
            'landing_links.*.url' => ['required_with:landing_links', 'string', 'max:500'],
            'landing_links.*.icon' => ['nullable', 'string', 'max:50'],
            'landing_links.*.is_highlight' => ['nullable', 'boolean'],
            'social_links' => ['nullable', 'array'],
            'social_links.instagram' => ['nullable', 'string', 'max:100'],
            'social_links.tiktok' => ['nullable', 'string', 'max:100'],
            'social_links.youtube' => ['nullable', 'string', 'max:100'],
            'social_links.facebook' => ['nullable', 'string', 'max:100'],
        ];
    }
}
