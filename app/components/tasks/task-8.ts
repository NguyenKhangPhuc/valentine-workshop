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
    // Check if user provided an image file to upload or replace photo.
    if (file != null) {
      // Define supported image MIME types for client-side validation.
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      // Verify uploaded file type against permitted list.
      if (!validTypes.includes(file.type.toLowerCase())) {
        // Define format rejection error message.
        const errorMsg = 'Unsupported image format. Please upload PNG, JPG, or WEBP images.'
        // Display toast error notification to the user.
        showNotification?.(errorMsg)
        // Throw error to abort file upload.
        throw new Error(errorMsg)
      }

      // Call server action updateCollectionItemPoster to upload to storage and update DB.
      const res = await updateCollectionItemPoster(item, file)
      // Check if server upload returned an error.
      if (res?.error) {
        // Log image upload error to console.
        console.error('Failed to update memory image in storage:', res.error)
        // Show failure toast notification to the user.
        showNotification?.('Failed to update image: ' + res.error)
        // Throw error to break out of execution.
        throw new Error(res.error)
      }

      // Create client-side object URL for immediate optimistic UI preview.
      const previewUrl = URL.createObjectURL(file)

      // Assemble updated memory item state with new preview URL.
      const updatedItem: CollectionItem = {
        ...item,
        image_url: previewUrl,
      }

      // Show success toast notification upon successful photo update.
      showNotification?.('Memory photo updated successfully!')

      // Check if onSuccess callback was provided.
      if (onSuccess) {
        // Invoke callback to pass updated item to parent state (isEdit = true).
        onSuccess(updatedItem, true)
      }

      // Return the updated memory item record.
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
    // Handle case when file is null: call server action to delete photo from storage.
    const res = await updateCollectionItemPoster(item, null)
    // Check if removal server action returned an error.
    if (res?.error) {
      // Log storage removal error to console.
      console.error('Failed to remove memory image from storage:', res.error)
      // Show failure toast notification to user.
      showNotification?.('Failed to remove image: ' + res.error)
      // Throw error to enter catch block.
      throw new Error(res.error)
    }

    // Assemble updated memory item state with image_url cleared to null.
    const clearedItem: CollectionItem = {
      ...item,
      image_url: null,
    }

    // Show success toast notification indicating photo removal.
    showNotification?.('Memory photo removed successfully!')

    // Check if onSuccess callback was provided.
    if (onSuccess) {
      // Invoke callback to notify parent state that image was removed (isEdit = false).
      onSuccess(clearedItem, false)
    }

    // Return the cleared memory item object.
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
