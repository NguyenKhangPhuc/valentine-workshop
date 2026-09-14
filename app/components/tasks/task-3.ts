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
 * Upstream field validation (such as requiring a name and parsing order numbers)
 * is managed declaratively by React Hook Form (`register`, `required`, `valueAsNumber`).
 * This function receives the pre-validated form inputs, links the memory with its
 * parent collection via `collection_id`, inserts the record into Supabase, and optionally
 * uploads an accompanying photo to Supabase Storage if an image file is provided.
 *
 * @usedBy
 * - `CreateMemoryItemModal.tsx` (`app/components/CreateMemoryItemModal.tsx`)
 *   Invoked inside `handleSubmit(onSubmit)` when the user fills out the memory creation form.
 */

import { CollectionItem, CollectionItemInsert } from '../../types/collection_item'
import { createNewCollectionItem, updateCollectionItemPoster } from '../../actions/collection_items'

/**
 * Form inputs for creating a new memory item.
 * Upstream validation is handled by React Hook Form.
 */
export interface CreateMemoryFormInputs {
  /** The title of this memory moment (required, validated by React Hook Form) */
  name: string
  /** Romantic narrative, thoughts, or notes about the moment (optional) */
  description?: string
  /** The date this memory occurred in YYYY-MM-DD format (optional) */
  memory_date?: string
  /** Page order index for chronological display in the book (optional, managed by React Hook Form) */
  order?: number
}

/**
 * Creates a new memory item associated with a collection, optionally uploading an image.
 *
 * @param {string} collectionId - The primary key of the parent collection this memory belongs to.
 * @param {CreateMemoryFormInputs} data - Pre-validated form fields and metadata from React Hook Form.
 * @param {File | null} [posterFile=null] - An optional photo file to upload and attach to this memory.
 * @param {(item: CollectionItem) => void} [onSuccess] - Optional callback to notify parent components.
 * @param {(message: string) => void} [showNotification] - Optional notification trigger for success and error alerts.
 * @returns {Promise<CollectionItem>} The newly created memory item with its database ID and image URL.
 *
 * @example
 * ```ts
 * const memory = await createMemory(
 *   "col-123",
 *   { name: "First Coffee Date", description: "At the corner cafe", memory_date: "2025-02-14", order: 1 },
 *   imageFile,
 *   (newItem) => setMemories(prev => [...prev, newItem]),
 *   showNotification
 * );
 * ```
 */
export async function createMemory(
  collectionId: string,
  data: CreateMemoryFormInputs,
  posterFile: File | null = null,
  onSuccess?: (item: CollectionItem) => void,
  showNotification?: (message: string) => void
): Promise<CollectionItem> {
  try {
    // --------------------------------------------------------------------------
    // Step 1: Assemble the database insert payload
    // --------------------------------------------------------------------------
    // Form validation (such as checking required name) is handled upfront by
    // React Hook Form via `{ required: 'Memory name is required' }`.
    // We map the validated inputs directly to `CollectionItemInsert`.
    const payload: CollectionItemInsert = {
      collection_id: collectionId,
      name: data.name,
      description: data.description || null,
      memory_date: data.memory_date || null,
      order: data.order ?? 1,
      image_url: null,
    }

    // --------------------------------------------------------------------------
    // Step 2: Insert the memory record into Supabase
    // --------------------------------------------------------------------------
    // Execute the Server Action to create the row in the 'collection_items' table.
    const res = await createNewCollectionItem(payload)
    if (res?.error || !res?.data) {
      const errorMessage = res?.error ?? 'Failed to create memory item in the database.'
      console.error(errorMessage)
      showNotification?.(errorMessage)
      throw new Error(errorMessage)
    }

    // Store the newly created record with its database-assigned primary key (`id`)
    let newItem: CollectionItem = res.data

    // --------------------------------------------------------------------------
    // Step 3: Upload optional image attachment to Supabase Storage
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
    // Step 4: Trigger success notification and notify parent state listeners
    // --------------------------------------------------------------------------
    showNotification?.('Memory item created successfully!')

    if (onSuccess) {
      onSuccess(newItem)
    }

    // Return the completed memory item
    return newItem
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to create memory item.'
    showNotification?.(errorMsg)
    throw error
  }
}
