'use server'

import { Collection, CollectionInsert } from "../types/collection"
import { createClient } from "../utils/supabase/server"

export const getAllCollectionsWithCollectionItems = async () => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collections').select('*, collection_items (*)')
    if (error) {
        console.log(error)
        return { data, error: "Failed to find all collections" }
    }
    return { data, error }
}

export const createNewCollection = async (collection: CollectionInsert) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collections').insert(collection).select().single();
    if (error) {
        console.log(error)
        return { error: "Failed to create new collection" }
    }
    return { data, error }
}

export const updateCollection = async (collection: Partial<Collection> & { id: string }) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collections').update(collection).eq('id', collection.id).select().single()
    if (error) {
        console.log(error)
        return { error: "Failed to update the collection" }
    }
    return { data, error: null }
}

export const deleteCollection = async (collectionId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collections').delete().eq('id', collectionId)
    if (error) {
        console.log(error)
        return { error: "Failed to delete collection" }
    }
    return { data, error: null }
}

export const updateCollectionPoster = async (collection: { id: string; poster_url?: string | null }, posterFile: File | null) => {
    const supabase = await createClient()

    if (posterFile != null) {
        let posterPath = `${collection.id}/${Date.now()}-${posterFile.name}`;
        if (collection.poster_url != null && !collection.poster_url.startsWith('/')) {
            await supabase.storage.from('attachments').remove([collection.poster_url])
        }
        const { error: storageError } = await supabase.storage.from('attachments').upload(posterPath, posterFile);
        if (storageError) {
            console.log("Storage upload error:", storageError)
        }

        const { data, error } = await supabase.from('collections').update({ poster_url: posterPath }).eq('id', collection.id).select().single()
        if (error) {
            return { data: null, error: "Failed to update poster" }
        }
        return { data, error: null }
    }

    if (collection.poster_url != null && !collection.poster_url.startsWith('/')) {
        await supabase.storage.from('attachments').remove([collection.poster_url])
    }
    const { data, error } = await supabase.from('collections').update({ poster_url: null }).eq('id', collection.id).select().single()
    if (error) {
        return { data: null, error: "Failed to clear poster" }
    }
    return { data, error: null }
}