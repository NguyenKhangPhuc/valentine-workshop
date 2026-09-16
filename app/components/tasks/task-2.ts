/**
 * ============================================================================
 * Task 2: Edit Collection
 * ============================================================================
 *
 * @file task-2.ts
 * @module components/tasks/task-2
 *
 * @description
 * This task handles editing the textual metadata of an existing collection
 * (title/name, description, start time, end time).
 * Upstream field validation (such as requiring a name) is handled declaratively
 * by React Hook Form (`register`, `required`).
 * This function receives the pre-validated form data, constructs a partial update
 * payload targeting the collection's primary key (`id`), sends the update to Supabase
 * via a Next.js Server Action, and produces a merged CollectionWithItems object that
 * preserves existing nested items and poster attachments.
 *
 * NOTE: This function specifically manages collection metadata (text fields and dates),
 * NOT the collection poster image file upload (which is handled separately in Task 7).
 *
 * @usedBy
 * - `EditCollectionModal.tsx` (`app/components/EditCollectionModal.tsx`)
 *   Invoked inside `handleSubmit(onSubmit)` when the user updates collection details in the edit dialog.
 */

import { CollectionWithItems } from '../../types/collection'
import { updateCollection } from '../../actions/collection'

/**
 * Form inputs for updating an existing collection.
 * Upstream validation is handled by React Hook Form.
 */
export interface EditCollectionFormInputs {
  /** Updated collection name or title (required, validated by React Hook Form) */
  name: string
  /** Updated description or notes (optional) */
  description?: string
  /** Updated start date string in YYYY-MM-DD format (optional) */
  start_time?: string
  /** Updated end date string in YYYY-MM-DD format (optional) */
  end_time?: string
}

/**
 * Updates an existing collection's textual metadata and returns the merged collection object.
 *
 * @param {CollectionWithItems} collection - The existing collection object being edited.
 * @param {EditCollectionFormInputs} data - Pre-validated form fields from React Hook Form.
 * @param {(updatedCollection: CollectionWithItems) => void} [onSuccess] - Optional callback triggered with the updated collection.
 * @param {(message: string) => void} [showNotification] - Optional notification trigger for success and error alerts.
 * @returns {Promise<CollectionWithItems>} The merged collection object containing the updated fields.
 *
 * @example
 * ```ts
 * const updated = await editCollection(
 *   currentCollection,
 *   { name: "Summer in Lapland", description: "Updated summer notes" },
 *   (updatedCol) => replaceCollectionInState(updatedCol),
 *   showNotification
 * );
 * ```
 */
export async function editCollection(
  collection: CollectionWithItems,
  data: EditCollectionFormInputs,
  onSuccess?: (updatedCollection: CollectionWithItems) => void,
  showNotification?: (message: string) => void
): Promise<CollectionWithItems> {
  try {
    /**
     * --------------------------------------------------------------------------
     * Step 1: Construct partial update payload
     * --------------------------------------------------------------------------
     * Specification:
     * - Form validation (ensuring name is present) is handled upfront by React Hook Form.
     * - Target the specific collection by its unique identifier (`collection.id`).
     * - Map updated fields (`name`, `description`, `start_time`, `end_time`),
     *   falling back empty fields to `null` to clear previous values in the database.
     */
    // Construct the partial update payload with the collection ID and form inputs.
    const updatePayload = {
      // Specify the target collection primary key ID to update.
      id: collection.id,
      // Set the updated collection title or name.
      name: data.name,
      // Set updated description or default to null if cleared.
      description: data.description || null,
      // Set updated start date string or default to null.
      start_time: data.start_time || null,
      // Set updated end date string or default to null.
      end_time: data.end_time || null,
    }

    /**
     * --------------------------------------------------------------------------
     * Step 2: Invoke Server Action to update collection in database
     * --------------------------------------------------------------------------
     * Specification:
     * - Execute `updateCollection(updatePayload)` to run an UPDATE query in Supabase.
     * - Inspect the server response; log error, display toast notification,
     *   and throw an Error if the update failed.
     */
    // Invoke server action updateCollection to update the collection row in Supabase.
    const res = await updateCollection(updatePayload)

    // Check whether the database update returned an error.
    if (res?.error) {
      // Log update failure to the console for debugging.
      console.error('Failed to update collection in database:', res.error)
      // Display failure toast alert to the user.
      showNotification?.('Failed to update collection: ' + res.error)
      // Throw error to jump into catch block.
      throw new Error(res.error)
    }

    /**
     * --------------------------------------------------------------------------
     * Step 3: Merge updated fields, display success toast, and notify parent state
     * --------------------------------------------------------------------------
     * Specification:
     * - Merge updated fields into the existing `collection` object to retain intact
     *   relations (`poster_url`, `collection_items`).
     * - Trigger a user-facing success notification via `showNotification`.
     * - Invoke `onSuccess` callback with the merged collection if provided.
     * - Return the updated `CollectionWithItems` record.
     */
    // Merge updated fields with existing items and poster to preserve state.
    const updatedCollection: CollectionWithItems = {
      ...collection,
      ...updatePayload,
      poster_url: res.data?.poster_url ?? null,
      collection_items: collection.collection_items ?? [],
    }

    // Display a success toast notification to the user.
    showNotification?.('Collection updated successfully!')

    // Check if an onSuccess callback was provided.
    if (onSuccess) {
      // Invoke callback to pass merged collection to parent component.
      onSuccess(updatedCollection)
    }

    // Return the updated collection object to caller.
    return updatedCollection
  } catch (error) {
    // Determine the error message string from caught error.
    const errorMsg = error instanceof Error ? error.message : 'Failed to update collection.'
    // Show error notification toast to alert the user.
    showNotification?.(errorMsg)
    // Re-throw caught error to allow calling component to handle failure.
    throw error
  }
}
