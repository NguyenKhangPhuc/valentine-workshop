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

export const updateCollection = async (collection: Collection) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collections').update(collection).eq('id', collection.id).select().single()
    if (error) {
        console.log(error)
        return { error: "Failed to update the collection" }
    }
    return { data, error }
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