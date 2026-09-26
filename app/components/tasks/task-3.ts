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
    /**
     * --------------------------------------------------------------------------
     * Step 1: Assemble database insert payload
     * --------------------------------------------------------------------------
     * Specification:
     * - Form validation (ensuring memory name is entered) is handled upfront by React Hook Form.
     * - Bind the memory moment to its parent collection via `collection_id`.
     * - Map form fields into `CollectionItemInsert`, defaulting `order` to 1.
     * - Initialize `image_url` to `null` prior to optional media file upload.
     */
    // TODO: Assemble the CollectionItemInsert payload with collection_id, name, description, memory_date, order, and image_url.

    /**
     * --------------------------------------------------------------------------
     * Step 2: Insert memory record into Supabase
     * --------------------------------------------------------------------------
     * Specification:
     * - Call Server Action `createNewCollectionItem(payload)` to insert into `collection_items` table.
     * - Validate database response; if error or missing data, display toast notification,
     *   log error, and throw Error.
     * - Store newly created memory item with its generated ID.
     */
    // TODO: Call server action createNewCollectionItem(payload) and validate the database response.

    /**
     * --------------------------------------------------------------------------
     * Step 3: Upload optional image attachment, notify parent state, and trigger notification
     * --------------------------------------------------------------------------
     * Specification:
     * - If `posterFile` is provided, upload image to Supabase Storage via `updateCollectionItemPoster`.
     * - Update local memory record representation with the saved storage path on success.
     * - Display a success toast alert to user via `showNotification`.
     * - Notify parent state via `onSuccess` callback if provided.
     * - Return the completed `CollectionItem` record.
     */
    // TODO: Upload optional posterFile using updateCollectionItemPoster, trigger toast notification, invoke onSuccess, and return the completed item.
    const newItem: CollectionItem = undefined as any

    return newItem
  } catch (error) {
    // Extract error message string from caught error object.
    const errorMsg = error instanceof Error ? error.message : 'Failed to create memory item.'
    // Display failure toast notification with the error details.
    showNotification?.(errorMsg)
    // Re-throw error so the calling modal can retain form input for retry.
    throw error
  }
}
