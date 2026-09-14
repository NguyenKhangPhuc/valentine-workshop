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
    // --------------------------------------------------------------------------
    // Step 1: Validate collection existence
    // --------------------------------------------------------------------------
    // Ensure the target collection is defined and has an ID
    if (!collection || !collection.id) {
      const errorMsg = 'Invalid collection: A collection with a valid ID is required to update its poster.'
      showNotification?.(errorMsg)
      throw new Error(errorMsg)
    }

    // --------------------------------------------------------------------------
    // Step 2: Handle case A - File Upload (Replacing or setting a poster)
    // --------------------------------------------------------------------------
    if (file != null) {
      // Basic MIME type validation on client side for fast user feedback
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!validTypes.includes(file.type.toLowerCase())) {
        const errorMsg = 'Unsupported file format. Please upload PNG, JPG, or WEBP images.'
        showNotification?.(errorMsg)
        throw new Error(errorMsg)
      }

      // Call the Next.js Server Action to upload to Supabase Storage and update the DB row
      const res = await updateCollectionPoster(collection, file)
      if (res?.error) {
        console.error('Failed to upload collection poster:', res.error)
        showNotification?.('Failed to update poster: ' + res.error)
        throw new Error(res.error)
      }

      // Generate a temporary browser object URL for immediate optimistic UI display
      const previewUrl = URL.createObjectURL(file)

      // Assemble the updated collection state
      const updatedCollection: CollectionWithItems = {
        ...collection,
        poster_url: previewUrl,
      }

      // Trigger success notification
      showNotification?.('Collection poster updated successfully!')

      // Trigger parent callback
      if (onSuccess) {
        onSuccess(updatedCollection)
      }

      return updatedCollection
    }

    // --------------------------------------------------------------------------
    // Step 3: Handle case B - File Removal (Clearing existing poster)
    // --------------------------------------------------------------------------
    // When file is null, the user wants to remove the cover image.
    // We invoke the server action with null to delete the cloud file and set DB column to null.
    const res = await updateCollectionPoster(collection, null)
    if (res?.error) {
      console.error('Failed to clear collection poster:', res.error)
      showNotification?.('Failed to remove poster: ' + res.error)
      throw new Error(res.error)
    }

    // Assemble the updated collection state with poster_url set to null
    const clearedCollection: CollectionWithItems = {
      ...collection,
      poster_url: null,
    }

    // Trigger success notification
    showNotification?.('Collection poster removed successfully!')

    // Trigger parent callback
    if (onSuccess) {
      onSuccess(clearedCollection)
    }

    return clearedCollection
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update collection poster.'
    showNotification?.(errorMsg)
    throw error
  }
}
