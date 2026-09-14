/**
 * ============================================================================
 * Task 3: Create Memory (Collection Item)
 * ============================================================================
 *
 * @file task-3.ts
 * @module components/tasks/task-3
 *
 * @description
 * This task handles creating a new individual memory item within a collection.
 * It associates the new memory with its parent collection through the `collection_id`
 * foreign key, inserts the record into Supabase, and optionally uploads an accompanying
 * photo/poster to Supabase Storage if an image file is provided.
 *
 * @usedBy
 * - `CreateMemoryItemModal.tsx` (`app/components/CreateMemoryItemModal.tsx`)
 *   Invoked when the user opens the "Add Memory" modal inside the flip book or collection viewer.
 */

import { CollectionItem, CollectionItemInsert } from '../../types/collection_item'
import { createNewCollectionItem, updateCollectionItemPoster } from '../../actions/collection_items'

/**
 * Form inputs for creating a new memory item.
 */
export interface CreateMemoryFormInputs {
  /** The title of this memory moment (required) */
  name: string
  /** Romantic narrative, thoughts, or notes about the moment (optional) */
  description?: string
  /** The date this memory occurred in YYYY-MM-DD format (optional) */
  memory_date?: string
  /** Page order index for chronological display in the book (optional, defaults to 1) */
  order?: number
}

/**
 * Creates a new memory item associated with a collection, optionally uploading an image.
 *
 * @param {string} collectionId - The primary key of the parent collection this memory belongs to.
 * @param {CreateMemoryFormInputs} data - The text fields and metadata for the new memory.
 * @param {File | null} [posterFile=null] - An optional photo file to upload and attach to this memory.
 * @param {(item: CollectionItem) => void} [onSuccess] - Optional callback to notify parent components.
 * @returns {Promise<CollectionItem>} The newly created memory item with its database ID and image URL.
 *
 * @example
 * ```ts
 * const memory = await createMemory(
 *   "col-123",
 *   { name: "First Coffee Date", description: "At the corner cafe", memory_date: "2025-02-14", order: 1 },
 *   imageFile,
 *   (newItem) => setMemories(prev => [...prev, newItem])
 * );
 * ```
 */
export async function createMemory(
  collectionId: string,
  data: CreateMemoryFormInputs,
  posterFile: File | null = null,
  onSuccess?: (item: CollectionItem) => void
): Promise<CollectionItem> {
  // --------------------------------------------------------------------------
  // Step 1: Validate mandatory parameters
  // --------------------------------------------------------------------------
  // Ensure the parent collection ID is valid to prevent orphan records.
  if (!collectionId || collectionId.trim() === '') {
    throw new Error('A valid collectionId is required to associate this memory item.')
  }

  // Ensure the memory has a descriptive title
  if (!data.name || data.name.trim() === '') {
    throw new Error('Memory name is required and cannot be empty.')
  }

  // --------------------------------------------------------------------------
  // Step 2: Assemble the database insert payload
  // --------------------------------------------------------------------------
  // Map form inputs to database schema types, converting empty strings to null.
  // We initialize `image_url` to null because the database record is inserted first.
  const payload: CollectionItemInsert = {
    collection_id: collectionId,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    memory_date: data.memory_date || null,
    order: data.order ?? 1,
    image_url: null,
  }

  // --------------------------------------------------------------------------
  // Step 3: Insert the memory record into Supabase
  // --------------------------------------------------------------------------
  // Execute the Server Action to create the row in the 'collection_items' table.
  const res = await createNewCollectionItem(payload)
  if (res?.error || !res?.data) {
    const errorMessage = res?.error ?? 'Failed to create memory item in the database.'
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  // Store the newly created record with its database-assigned primary key (`id`)
  let newItem: CollectionItem = res.data

  // --------------------------------------------------------------------------
  // Step 4: Upload optional image attachment to Supabase Storage
  // --------------------------------------------------------------------------
  // If the user selected a photo during creation, upload it using the newly
  // obtained `newItem.id` as the storage bucket folder prefix.
  if (posterFile) {
    const resPoster = await updateCollectionItemPoster(newItem, posterFile)
    if (resPoster?.data && !resPoster.error) {
      // Update our local representation with the saved storage path
      newItem = {
        ...newItem,
        image_url: resPoster.data,
      }
    } else if (resPoster?.error) {
      console.warn('Memory record created, but image upload failed:', resPoster.error)
    }
  }

  // --------------------------------------------------------------------------
  // Step 5: Notify parent state listeners
  // --------------------------------------------------------------------------
  // Trigger callback so the parent UI (flipbook, list) receives the new memory immediately.
  if (onSuccess) {
    onSuccess(newItem)
  }

  // Return the completed memory item
  return newItem
}
