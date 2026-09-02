import { Database } from "./database.types"

export type CollectionItem = Database["public"]["Tables"]["collection_items"]["Row"]

export type CollectionItemInsert = Database["public"]["Tables"]["collection_items"]["Insert"]