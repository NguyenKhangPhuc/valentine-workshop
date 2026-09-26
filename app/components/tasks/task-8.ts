/**
 * ============================================================================
 * Task 8: Edit Memory Poster (Photo Attachment)
 * ============================================================================
 *
 * @file task-8.ts
 * @module components/tasks/task-8
 *
 * @description
 * This task manages uploading, replacing, or deleting the photo/image attachment
 * belonging to a specific memory item.
 * It interacts with the Next.js Server Action (`updateCollectionItemPoster`) to:
 * 1. Store the uploaded file in Supabase Storage (`attachments` bucket).
 * 2. Delete the previously associated file from storage (if any).
 * 3. Update the memory's `image_url` column in the `collection_items` table.
 * 4. Support clearing/deleting the image when `file` is `null`.
 *
 * @usedBy
 * - `EditMemoryItemModal.tsx` (`app/components/EditMemoryItemModal.tsx`)
 *   Invoked when replacing or removing a photo within the memory edit dialog.
 * - `MemoryBookModal.tsx` (`app/components/MemoryBookModal.tsx`)
 *   Invoked directly from the book flip page when dragging & dropping a new photo
 *   or clicking "Remove" / "Change Image" on the active page.
 */

import { CollectionItem } from '../../types/collection_item'
import { updateCollectionItemPoster } from '../../actions/collection_items'

/**
 * Updates or removes the photo attachment of a memory item.
 *
 * @param {CollectionItem} item - The memory item whose photo is being modified.
 * @param {File | null} file - The new photo file to upload, or `null` to delete the existing photo.
 * @param {(updatedItem: CollectionItem, isEdit: boolean) => void} [onSuccess] - Optional callback to update UI state.
 * @param {(message: string) => void} [showNotification] - Optional notification trigger for success and error alerts.
 * @returns {Promise<CollectionItem>} The updated memory item record with the new or cleared image URL.
 *
 * @example
 * ```ts
 * // Upload / Replace photo
 * const updated = await editMemoryPoster(currentMemory, newImageFile, (item) => syncMemory(item), showNotification);
 *
 * // Delete photo
 * const cleared = await editMemoryPoster(currentMemory, null, (item) => syncMemory(item), showNotification);
 * ```
 */
export async function editMemoryPoster(
  item: CollectionItem,
  file: File | null,
  onSuccess?: (updatedItem: CollectionItem, isEdit: boolean) => void,
  showNotification?: (message: string) => void
): Promise<CollectionItem> {
  try {
    /**
     * --------------------------------------------------------------------------
     * Step 1: Validate target memory item existence
     * --------------------------------------------------------------------------
     * Specification:
     * - Verify that `item` reference and `item.id` are defined.
     * - If missing, display a toast notification and throw Error to abort.
     */
    // Check if target memory item is valid and has an ID.
    if (!item || !item.id) {
      // Define error message for missing item reference.
      const errorMsg = 'Invalid memory item: A memory item with a valid ID is required to update its image.'
      // Show error toast notification to user.
      showNotification?.(errorMsg)
      // Throw error to abort photo update.
      throw new Error(errorMsg)
    }

    /**
     * --------------------------------------------------------------------------
     * Step 2: Handle Case A - Photo Upload / Replacement (when file is provided)
     * --------------------------------------------------------------------------
     * Specification:
     * - Validate client-side image MIME types (PNG, JPG, WEBP).
     * - Call Server Action `updateCollectionItemPoster(item, file)` to upload file.
     * - Generate optimistic browser object URL (`URL.createObjectURL(file)`).
     * - Trigger success toast and invoke `onSuccess(updatedItem, true)`.
     * - Return the updated `CollectionItem` record.
     */
    if (file != null) {
      // TODO: Validate image MIME types, call server action updateCollectionItemPoster(item, file), create optimistic previewUrl, show toast, invoke onSuccess, and return updated item.
      const updatedItem: CollectionItem = undefined as any

      return updatedItem
    }

    /**
     * --------------------------------------------------------------------------
     * Step 3: Handle Case B - Photo Removal / Deletion (when file is null)
     * --------------------------------------------------------------------------
     * Specification:
     * - Invoke `updateCollectionItemPoster(item, null)` to purge cloud file and set DB column to null.
     * - Assemble cleared memory item with `image_url: null`.
     * - Trigger photo removal success toast notification via `showNotification`.
     * - Notify parent state via `onSuccess(clearedItem, false)` callback if provided.
     * - Return cleared `CollectionItem` record.
     */
    // TODO: Call server action updateCollectionItemPoster(item, null), set image_url to null, show toast, invoke onSuccess, and return cleared item.
    const clearedItem: CollectionItem = undefined as any

    return clearedItem
  } catch (error) {
    // Extract error message string from caught error object.
    const errorMsg = error instanceof Error ? error.message : 'Failed to update memory photo.'
    // Display error toast notification to alert the user.
    showNotification?.(errorMsg)
    // Re-throw error to let calling modal handle failure.
    throw error
  }
}
