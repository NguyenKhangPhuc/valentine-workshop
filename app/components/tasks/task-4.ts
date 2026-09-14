/**
 * ============================================================================
 * Task 4: Edit Memory (Collection Item)
 * ============================================================================
 *
 * @file task-4.ts
 * @module components/tasks/task-4
 *
 * @description
 * This task handles updating an existing memory item's textual details and metadata
 * (name/title, notes/description, date of memory, and page display order).
 * It sends a partial update to the Supabase database via Next.js Server Action and
 * returns the updated record while keeping existing media attachments intact.
 *
 * NOTE: This function specifically manages text details and order, NOT image/photo
 * file replacements (which is handled separately in Task 8).
 *
 * @usedBy
 * - `EditMemoryItemModal.tsx` (`app/components/EditMemoryItemModal.tsx`)
 *   Invoked when the user edits a memory's text or date and submits the edit form.
 */

import { CollectionItem } from '../../types/collection_item'
import { updateCollectionItem } from '../../actions/collection_items'

/**
 * Form inputs for updating an existing memory item.
 */
export interface EditMemoryFormInputs {
  /** Updated title of this memory moment (required) */
  name: string
  /** Updated romantic narrative, thoughts, or notes (optional) */
  description?: string
  /** Updated memory date string in YYYY-MM-DD format (optional) */
  memory_date?: string
  /** Updated sequence order for the flip book page display (optional) */
  order?: number
}

/**
 * Updates an existing memory item's textual metadata and page order in the database.
 *
 * @param {CollectionItem} itemToEdit - The current memory item being modified.
 * @param {EditMemoryFormInputs} data - The updated form fields.
 * @param {(item: CollectionItem, isEdit: boolean) => void} [onSuccess] - Optional callback triggered on successful update.
 * @returns {Promise<CollectionItem>} The updated memory item record.
 *
 * @example
 * ```ts
 * const updated = await editMemory(
 *   currentMemory,
 *   { name: "Second Date at the Beach", description: "Watching the sunset", order: 2 },
 *   (item) => replaceItemInState(item)
 * );
 * ```
 */
export async function editMemory(
  itemToEdit: CollectionItem,
  data: EditMemoryFormInputs,
  onSuccess?: (item: CollectionItem, isEdit: boolean) => void
): Promise<CollectionItem> {
  // --------------------------------------------------------------------------
  // Step 1: Validate input parameters
  // --------------------------------------------------------------------------
  // Ensure we are targeting an actual existing memory record with a valid ID
  if (!itemToEdit || !itemToEdit.id) {
    throw new Error('Invalid item: An existing memory item with a valid ID is required.')
  }

  // Ensure title is not empty or pure whitespace
  if (!data.name || data.name.trim() === '') {
    throw new Error('Memory name is required and cannot be empty.')
  }

  // --------------------------------------------------------------------------
  // Step 2: Assemble the partial update payload
  // --------------------------------------------------------------------------
  // We keep the primary key `id` and sanitize optional fields to null.
  // We also fallback to the current order if no new order was provided.
  const payload = {
    id: itemToEdit.id,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    memory_date: data.memory_date || null,
    order: data.order ?? itemToEdit.order ?? 1,
  }

  // --------------------------------------------------------------------------
  // Step 3: Call the Next.js Server Action to update the database
  // --------------------------------------------------------------------------
  // Invokes `updateCollectionItem` which runs an UPDATE SQL query in Supabase.
  const res = await updateCollectionItem(payload)
  if (res?.error || !res?.data) {
    const errorMsg = res?.error ?? 'Failed to update memory item in the database.'
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  // --------------------------------------------------------------------------
  // Step 4: Merge returned data with existing attributes
  // --------------------------------------------------------------------------
  // Ensure fields like `image_url` and `collection_id` are intact
  const updatedItem: CollectionItem = {
    ...itemToEdit,
    ...res.data,
    image_url: itemToEdit.image_url, // Safeguard existing image path
  }

  // --------------------------------------------------------------------------
  // Step 5: Notify parent listeners
  // --------------------------------------------------------------------------
  // Notify the parent modal/flipbook view that the memory has been updated
  if (onSuccess) {
    onSuccess(updatedItem, true)
  }

  // Return the updated memory record
  return updatedItem
}
