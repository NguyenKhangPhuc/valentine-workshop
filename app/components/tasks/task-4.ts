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
    // Assemble the partial update payload with item ID and edited fields.
    const payload = {
      // Target the existing memory item ID to update.
      id: itemToEdit.id,
      // Update memory name/title from validated form input.
      name: data.name,
      // Update narrative description or set to null if empty.
      description: data.description || null,
      // Update memory date or set to null if empty.
      memory_date: data.memory_date || null,
      // Update book page display order index.
      order: data.order,
    }

    // Call server action updateCollectionItem to update the record in Supabase.
    const res = await updateCollectionItem(payload)

    // Check if the update query returned an error or missing data.
    if (res?.error || !res?.data) {
      // Derive error message from response or fallback text.
      const errorMsg = res?.error ?? 'Failed to update memory item in the database.'
      // Log update failure to the console.
      console.error(errorMsg)
      // Display toast notification alerting user to the failure.
      showNotification?.(errorMsg)
      // Throw error to break execution into catch block.
      throw new Error(errorMsg)
    }

    // Merge updated fields while safeguarding existing image_url.
    const updatedItem: CollectionItem = {
      ...res.data,
      image_url: res.data.image_url,
    }

    // Display success toast notification upon successful update.
    showNotification?.('Memory item updated successfully!')

    // Check if an onSuccess callback was provided by parent component.
    if (onSuccess) {
      // Notify parent component that item was updated (isEdit = true).
      onSuccess(updatedItem, true)
    }

    // Return the updated memory item record.
    return updatedItem
  } catch (error) {
    // Extract message from caught error object.
    const errorMsg = error instanceof Error ? error.message : 'Failed to update memory item.'
    // Show error toast notification to the user.
    showNotification?.(errorMsg)
    // Re-throw error so caller can handle form submission state.
    throw error
  }
}
