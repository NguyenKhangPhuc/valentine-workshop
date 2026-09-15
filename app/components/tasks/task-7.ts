/**
 * ============================================================================
 * Task 7: Edit Collection Poster
 * ============================================================================
 *
 * @file task-7.ts
 * @module components/tasks/task-7
 *
 * @description
 * This task handles updating or removing the cover poster image for a collection.
 * It manages:
 * 1. Uploading a new image file (`File`) to the Supabase Storage bucket (`attachments`).
 * 2. Deleting old storage files to prevent orphan files and save storage quota.
 * 3. Updating the collection record's `poster_url` in the database.
 * 4. Clearing/removing the poster when `file` is `null`.
 *
 * @usedBy
 * - `EditCollectionModal.tsx` (`app/components/EditCollectionModal.tsx`)
 *   Invoked when the user drags and drops a new poster, chooses a file via the
 *   file picker, or clicks the "Delete/Remove Poster" button.
 */

import { CollectionWithItems } from '../../types/collection'
import { updateCollectionPoster } from '../../actions/collection'

/**
 * Updates or removes the poster cover image for a collection.
 *
 * @param {CollectionWithItems} collection - The collection whose poster is being modified.
 * @param {File | null} file - The new image file to upload, or `null` to clear the existing poster.
 * @param {(updatedCollection: CollectionWithItems) => void} [onSuccess] - Optional callback triggered on success.
 * @param {(message: string) => void} [showNotification] - Optional notification trigger for success and error alerts.
 * @returns {Promise<CollectionWithItems>} The updated collection object with the new or cleared `poster_url`.
 *
 * @example
 * ```ts
 * // Upload a new poster
 * const updated = await editCollectionPoster(currentCol, selectedFile, (col) => updateState(col), showNotification);
 *
 * // Clear/remove the existing poster
 * const cleared = await editCollectionPoster(currentCol, null, (col) => updateState(col), showNotification);
 * ```
 */
export async function editCollectionPoster(
  collection: CollectionWithItems,
  file: File | null,
  onSuccess?: (updatedCollection: CollectionWithItems) => void,
  showNotification?: (message: string) => void
): Promise<CollectionWithItems> {
  try {
    // Check if target collection is valid and contains an ID.
    if (!collection || !collection.id) {
      // Define error message for missing collection reference.
      const errorMsg = 'Invalid collection: A collection with a valid ID is required to update its poster.'
      // Show error toast notification to user.
      showNotification?.(errorMsg)
      // Throw error to cancel execution.
      throw new Error(errorMsg)
    }

    // Check if user provided a file to upload or replace poster.
    if (file != null) {
      // Define supported image MIME types for client-side validation.
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      // Verify uploaded file format against valid MIME types list.
      if (!validTypes.includes(file.type.toLowerCase())) {
        // Define format rejection error message.
        const errorMsg = 'Unsupported file format. Please upload PNG, JPG, or WEBP images.'
        // Display toast error notification to the user.
        showNotification?.(errorMsg)
        // Throw error to abort file upload.
        throw new Error(errorMsg)
      }

      // Call server action updateCollectionPoster to upload to storage and update DB.
      const res = await updateCollectionPoster(collection, file)
      // Check if server upload returned an error.
      if (res?.error) {
        // Log storage upload error to console.
        console.error('Failed to upload collection poster:', res.error)
        // Show failure toast notification to the user.
        showNotification?.('Failed to update poster: ' + res.error)
        // Throw error to break out of execution.
        throw new Error(res.error)
      }

      // Create client-side object URL for immediate optimistic UI preview.
      const previewUrl = URL.createObjectURL(file)

      // Assemble updated collection state containing new preview URL.
      const updatedCollection: CollectionWithItems = {
        ...collection,
        poster_url: previewUrl,
      }

      // Show success toast notification upon successful poster update.
      showNotification?.('Collection poster updated successfully!')

      // Check if onSuccess callback was provided.
      if (onSuccess) {
        // Invoke callback to pass updated collection to parent state.
        onSuccess(updatedCollection)
      }

      // Return the updated collection object.
      return updatedCollection
    }

    // Handle case when file is null: call server action to delete poster and set column null.
    const res = await updateCollectionPoster(collection, null)
    // Check if removal server action returned an error.
    if (res?.error) {
      // Log storage removal error to console.
      console.error('Failed to clear collection poster:', res.error)
      // Show failure toast notification to user.
      showNotification?.('Failed to remove poster: ' + res.error)
      // Throw error to enter catch block.
      throw new Error(res.error)
    }

    // Assemble updated collection state with poster_url cleared to null.
    const clearedCollection: CollectionWithItems = {
      ...collection,
      poster_url: null,
    }

    // Show success toast notification indicating poster removal.
    showNotification?.('Collection poster removed successfully!')

    // Check if onSuccess callback was provided.
    if (onSuccess) {
      // Invoke callback to notify parent state of poster removal.
      onSuccess(clearedCollection)
    }

    // Return the cleared collection object.
    return clearedCollection
  } catch (error) {
    // Extract error message string from caught error object.
    const errorMsg = error instanceof Error ? error.message : 'Failed to update collection poster.'
    // Display error toast notification to alert the user.
    showNotification?.(errorMsg)
    // Re-throw error to let calling modal handle failure.
    throw error
  }
}
