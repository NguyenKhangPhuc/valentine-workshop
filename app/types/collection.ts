import { CollectionItem } from "./collection_item"
import { Database } from "./database.types"

export type Collection = Database["public"]["Tables"]["collections"]["Row"]

export type CollectionInsert = Database["public"]["Tables"]["collections"]["Insert"]

export interface CollectionWithItems extends Collection {
    collection_items: CollectionItem[]
}