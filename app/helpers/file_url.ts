import { SupabaseClient } from "@supabase/supabase-js"

export const handleGetUrl = (supabase: SupabaseClient, imagePath: string): string => {
    const { data } = supabase.storage.from('attachments').getPublicUrl(imagePath)
    return data.publicUrl
}