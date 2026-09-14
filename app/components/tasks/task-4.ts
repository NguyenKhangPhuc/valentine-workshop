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
 * Upstream field validation (such as requiring a name) is handled declaratively
 * by React Hook Form (`register`, `required`, `valueAsNumber`).
 * This function receives the pre-validated form inputs, sends a partial update to
 * Supabase via a Next.js Server Action, and returns the updated record while keeping
 * existing media attachments intact.
 *
 * NOTE: This function specifically manages text details and order, NOT image/photo
 * file replacements (which is handled separately in Task 8).
 *
 * @usedBy
 * - `EditMemoryItemModal.tsx` (`app/components/EditMemoryItemModal.tsx`)
 *   Invoked inside `handleSubmit(onSubmit)` when the user edits a memory's text or date.
 */

import { CollectionItem } from '../../types/collection_item'
import { updateCollectionItem } from '../../actions/collection_items'

/**
 * Form inputs for updating an existing memory item.
 * Upstream validation is handled by React Hook Form.
 */
export interface EditMemoryFormInputs {
  /** Updated title of this memory moment (required, validated by React Hook Form) */
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
 * @param {EditMemoryFormInputs} data - Pre-validated form fields from React Hook Form.
 * @param {(item: CollectionItem, isEdit: boolean) => void} [onSuccess] - Optional callback triggered on successful update.
 * @param {(message: string) => void} [showNotification] - Optional notification trigger for success and error alerts.
 * @returns {Promise<CollectionItem>} The updated memory item record.
 *
 * @example
 * ```ts
 * const updated = await editMemory(
 *   currentMemory,
 *   { name: "Second Date at the Beach", description: "Watching the sunset", order: 2 },
 *   (item) => replaceItemInState(item),
 *   showNotification
 * );
 * ```
 */
export async function editMemory(
  itemToEdit: CollectionItem,
  data: EditMemoryFormInputs,
  onSuccess?: (item: CollectionItem, isEdit: boolean) => void,
  showNotification?: (message: string) => void
): Promise<CollectionItem> {
  try {
    // --------------------------------------------------------------------------
    // Step 1: Assemble the partial update payload
    // --------------------------------------------------------------------------
    // Form validation (such as checking required name) is handled upfront by
    // React Hook Form via `{ required: 'Memory name is required' }`.
    // We map the validated inputs directly to our update payload.
    const payload = {
      id: itemToEdit.id,
      name: data.name,
      description: data.description || null,
      memory_date: data.memory_date || null,
      order: data.order ?? itemToEdit.order ?? 1,
    }

    // --------------------------------------------------------------------------
    // Step 2: Call the Next.js Server Action to update the database
    // --------------------------------------------------------------------------
    // Invokes `updateCollectionItem` which runs an UPDATE SQL query in Supabase.
    const res = await updateCollectionItem(payload)
    if (res?.error || !res?.data) {
      const errorMsg = res?.error ?? 'Failed to update memory item in the database.'
      console.error(errorMsg)
      showNotification?.(errorMsg)
      throw new Error(errorMsg)
    }

    // --------------------------------------------------------------------------
    // Step 3: Merge returned data with existing attributes
    // --------------------------------------------------------------------------
    // Ensure fields like `image_url` and `collection_id` are intact
    const updatedItem: CollectionItem = {
      ...itemToEdit,
      ...res.data,
      image_url: itemToEdit.image_url, // Safeguard existing image path
    }

    // --------------------------------------------------------------------------
    // Step 4: Trigger success notification and notify parent listeners
    // --------------------------------------------------------------------------
    showNotification?.('Memory item updated successfully!')

    if (onSuccess) {
      onSuccess(updatedItem, true)
    }

    // Return the updated memory record
    return updatedItem
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update memory item.'
    showNotification?.(errorMsg)
    throw error
  }
}
