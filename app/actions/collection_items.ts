'use server'

import { CollectionItem, CollectionItemInsert } from "../types/collection_item"
import { createClient } from "../utils/supabase/server"

export const createNewCollectionItem = async (collectionItem: CollectionItemInsert) => {
    const supabase = await createClient()

    const { data, error } = await supabase.from('collection_items').insert(collectionItem).select().single();
    if (error) {
        console.log("Create Collection Item Error:", error)
        return { error: "Failed to create new collection item" }
    }
    return { data, error: null }
}

export const updateCollectionItem = async (collectionItem: Partial<CollectionItem> & { id: string }) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collection_items').update(collectionItem).eq('id', collectionItem.id).select().single()
    if (error) {
        console.log("Update Collection Item Error:", error)
        return { error: "Failed to update collection item" }
    }
    return { data, error: null }
}

export const deleteCollectionItem = async (itemId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collection_items').delete().eq('id', itemId)
    if (error) {
        console.log("Delete Collection Item Error:", error)
        return { error: "Failed to delete the collection item" }
    }
    return { data, error: null }
}

export const updateCollectionItemPoster = async (collectionItem: CollectionItem, posterFile: File | null) => {
    const supabase = await createClient()

    if (posterFile != null) {
        let posterPath = `${collectionItem.id}/${Date.now()}-${posterFile.name}`;
        if (collectionItem.image_url != null && !collectionItem.image_url.startsWith('/')) {
            await supabase.storage.from('attachments').remove([collectionItem.image_url])
        }
        const { error: storageError } = await supabase.storage.from('attachments').upload(posterPath, posterFile);
        if (storageError) {
            console.log("Storage upload error:", storageError)
        }

        const { data, error } = await supabase.from('collection_items').update({ image_url: posterPath }).eq('id', collectionItem.id).select().single()
        if (error) {
            return { data: null, error: "Failed to update image" }
        }
        return { data: posterPath, error: null }
    }

    if (collectionItem.image_url != null && !collectionItem.image_url.startsWith('/')) {
        await supabase.storage.from('attachments').remove([collectionItem.image_url])
    }
    const { data, error } = await supabase.from('collection_items').update({ image_url: null }).eq('id', collectionItem.id).select().single()
    if (error) {
        return { data: null, error: "Failed to clear image" }
    }
    return { data: null, error: null }
}