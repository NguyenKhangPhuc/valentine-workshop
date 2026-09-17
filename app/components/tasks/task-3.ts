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
    // Assemble the database payload linking this memory to its parent collection.
    const payload: CollectionItemInsert = {
      // Assign foreign key of the parent collection.
      collection_id: collectionId,
      // Assign the validated memory title/name.
      name: data.name,
      // Provide optional description or fallback to null.
      description: data.description || null,
      // Assign optional memory date or fallback to null.
      memory_date: data.memory_date || null,
      // Set page display order, defaulting to page 1 if omitted.
      order: data.order ?? 1,
      // Initialize image URL as null before optional file upload.
      image_url: null,
    }

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
    // Call server action createNewCollectionItem to insert the row in Supabase.
    const res = await createNewCollectionItem(payload)

    // Check if the server action failed or did not return inserted data.
    if (res?.error || !res?.data) {
      // Formulate error message from response or fallback string.
      const errorMessage = res?.error ?? 'Failed to create memory item in the database.'
      // Log database error to the developer console.
      console.error(errorMessage)
      // Display error notification toast to the user.
      showNotification?.(errorMessage)
      // Throw error to abort creation and enter catch block.
      throw new Error(errorMessage)
    }

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
    // Store the newly created memory record returned from database.
    let newItem: CollectionItem = res.data

    // Check if an image attachment file was provided by the user.
    if (posterFile) {
      // Upload image to storage bucket using item ID as directory prefix.
      const resPoster = await updateCollectionItemPoster(newItem, posterFile)
      // Verify storage upload succeeded and returned a storage path.
      if (resPoster?.data && !resPoster.error) {
        // Update local memory item representation with the uploaded image path.
        newItem = {
          ...newItem,
          image_url: resPoster.data,
        }
      // Handle scenario where memory was created but file upload encountered an error.
      } else if (resPoster?.error) {
        // Log warning that record was created but image upload failed.
        console.warn('Memory record created, but image upload failed:', resPoster.error)
      }
    }

    // Display a success toast notification to the user.
    showNotification?.('Memory item created successfully!')

    // Check if an onSuccess callback was provided.
    if (onSuccess) {
      // Log new item and notify parent component with the completed record.
      console.log(newItem)
      onSuccess(newItem)
    }

    // Return the newly created memory item to the caller.
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
