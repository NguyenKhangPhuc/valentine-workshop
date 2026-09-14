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
    // --------------------------------------------------------------------------
    // Step 1: Construct the partial update payload
    // --------------------------------------------------------------------------
    // Form validation (e.g. required collection name) is handled upfront by
    // React Hook Form via `{ required: 'Collection name is required' }`.
    // We map the validated inputs directly to our update payload with the target ID.
    const updatePayload = {
      id: collection.id,
      name: data.name,
      description: data.description || null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
    }

    // --------------------------------------------------------------------------
    // Step 2: Invoke the Next.js Server Action to update Supabase
    // --------------------------------------------------------------------------
    // `updateCollection` executes a parameterized UPDATE query on the 'collections' table.
    const res = await updateCollection(updatePayload)
    if (res?.error) {
      console.error('Failed to update collection in database:', res.error)
      showNotification?.('Failed to update collection: ' + res.error)
      throw new Error(res.error)
    }

    // --------------------------------------------------------------------------
    // Step 3: Merge updated fields into the existing collection object
    // --------------------------------------------------------------------------
    // To avoid wiping out items or poster URL, we merge the existing collection
    // with the new payload values.
    const updatedCollection: CollectionWithItems = {
      ...collection,
      ...updatePayload,
      poster_url: collection.poster_url,
      collection_items: collection.collection_items ?? [],
    }

    // --------------------------------------------------------------------------
    // Step 4: Trigger success notification and notify parent state listeners
    // --------------------------------------------------------------------------
    showNotification?.('Collection updated successfully!')

    if (onSuccess) {
      onSuccess(updatedCollection)
    }

    // Return the newly merged collection
    return updatedCollection
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to update collection.'
    showNotification?.(errorMsg)
    throw error
  }
}
