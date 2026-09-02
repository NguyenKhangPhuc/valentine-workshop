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
