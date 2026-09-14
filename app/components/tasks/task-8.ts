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
 * @returns {Promise<CollectionItem>} The updated memory item record with the new or cleared image URL.
 *
 * @example
 * ```ts
 * // Upload / Replace photo
 * const updated = await editMemoryPoster(currentMemory, newImageFile, (item) => syncMemory(item));
 *
 * // Delete photo
 * const cleared = await editMemoryPoster(currentMemory, null, (item) => syncMemory(item));
 * ```
 */
export async function editMemoryPoster(
  item: CollectionItem,
  file: File | null,
  onSuccess?: (updatedItem: CollectionItem, isEdit: boolean) => void
): Promise<CollectionItem> {
  // --------------------------------------------------------------------------
  // Step 1: Validate item existence
  // --------------------------------------------------------------------------
  // Ensure the target memory item is defined and contains an ID
  if (!item || !item.id) {
    throw new Error('Invalid memory item: A memory item with a valid ID is required to update its image.')
  }

  // --------------------------------------------------------------------------
  // Step 2: Handle case A - Upload / Replace photo
  // --------------------------------------------------------------------------
  if (file != null) {
    // Validate that the uploaded file is a supported image format
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      throw new Error('Unsupported image format. Please upload PNG, JPG, or WEBP images.')
    }

    // Call the Next.js Server Action to upload to Supabase Storage
    const res = await updateCollectionItemPoster(item, file)
    if (res?.error) {
      console.error('Failed to update memory image in storage:', res.error)
      throw new Error(res.error)
    }

    // Create a client-side object URL for immediate optimistic UI preview
    const previewUrl = URL.createObjectURL(file)

    // Assemble the updated memory item
    const updatedItem: CollectionItem = {
      ...item,
      image_url: previewUrl,
    }

    // Trigger parent callback (e.g. updating the flip book's memory item list)
    if (onSuccess) {
      onSuccess(updatedItem, true)
    }

    return updatedItem
  }

  // --------------------------------------------------------------------------
  // Step 3: Handle case B - Remove / Clear photo
  // --------------------------------------------------------------------------
  // When file is null, the user chose to remove the photo.
  // Invoke the server action with null to delete the cloud file and set DB column to null.
  const res = await updateCollectionItemPoster(item, null)
  if (res?.error) {
    console.error('Failed to remove memory image from storage:', res.error)
    throw new Error(res.error)
  }

  // Assemble the updated memory item with image_url set to null
  const clearedItem: CollectionItem = {
    ...item,
    image_url: null,
  }

  // Trigger parent callback
  if (onSuccess) {
    onSuccess(clearedItem, false)
  }

  return clearedItem
}
