'use server'

import { CollectionInsert } from "../types/collection"
import { CollectionItem, CollectionItemInsert } from "../types/collection_item"
import { createClient } from "../utils/supabase/server"



export const createNewCollectionItem = async (collectionItem: CollectionItemInsert) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collection_items').insert(collectionItem).single();
    if (error) {
        console.log(error)
        return { error: "Failed to create new collection" }
    }
    return { data, error }
}

export const updateCollectionItem = async (collectionItem: CollectionItem) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collection_items').update(collectionItem).eq('id', collectionItem.id)
    if (error) {
        console.log(error)
        return { error: "Failed to update collection items" }
    }
}

export const deleteCollectionItem = async (itemId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collection_items').delete().eq('id', itemId)
    if (error) {
        console.log(error)
        return { error: "Failed to delete the collection items" }
    }
    return { data, error }
}

