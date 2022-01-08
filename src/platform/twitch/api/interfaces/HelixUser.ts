export interface HelixUser {
    broadcaster_type: 'partner' | 'affiliate' | '';
    description: string;
    display_name: string;
    id: string;
    login: string;
    offline_image_url: string;
    profile_image_url: string;
    type: 'staff' | 'admin' | 'global_mod' | '';
    view_count: number;
    email?: string;
    created_at: string;
}
