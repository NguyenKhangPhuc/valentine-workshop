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
 * It sanitizes user inputs, constructs a partial update payload targeting the
 * collection's primary key (`id`), sends the update to Supabase via a Next.js Server Action,
 * and produces a merged CollectionWithItems object that preserves existing nested items
 * and poster attachments.
 *
 * NOTE: This function specifically manages collection metadata (text fields and dates),
 * NOT the collection poster image file upload (which is handled separately in Task 7).
 *
 * @usedBy
 * - `EditCollectionModal.tsx` (`app/components/EditCollectionModal.tsx`)
 *   Invoked when the user updates collection details in the edit dialog and submits the form.
 */

import { CollectionWithItems } from '../../types/collection'
import { updateCollection } from '../../actions/collection'

/**
 * Form inputs for updating an existing collection.
 */
export interface EditCollectionFormInputs {
  /** Updated collection name or title (required) */
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
 * @param {EditCollectionFormInputs} data - The updated form fields entered by the user.
 * @param {(updatedCollection: CollectionWithItems) => void} [onSuccess] - Optional callback triggered with the updated collection.
 * @returns {Promise<CollectionWithItems>} The merged collection object containing the updated fields.
 *
 * @example
 * ```ts
 * const updated = await editCollection(
 *   currentCollection,
 *   { name: "Summer in Lapland", description: "Updated summer notes" },
 *   (updatedCol) => replaceCollectionInState(updatedCol)
 * );
 * ```
 */
export async function editCollection(
  collection: CollectionWithItems,
  data: EditCollectionFormInputs,
  onSuccess?: (updatedCollection: CollectionWithItems) => void
): Promise<CollectionWithItems> {
  // --------------------------------------------------------------------------
  // Step 1: Validate input parameters and prerequisites
  // --------------------------------------------------------------------------
  // Verify that an existing collection with a valid ID was supplied.
  if (!collection || !collection.id) {
    throw new Error('Invalid collection: An existing collection with a valid ID is required.')
  }

  // Verify that the title/name is not blank
  if (!data.name || data.name.trim() === '') {
    throw new Error('Collection name is required and cannot be empty.')
  }

  // --------------------------------------------------------------------------
  // Step 2: Construct the partial update payload
  // --------------------------------------------------------------------------
  // We specify the target ID and convert optional empty strings to `null`
  // so that cleared inputs properly clear values in the database.
  const updatePayload = {
    id: collection.id,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    start_time: data.start_time || null,
    end_time: data.end_time || null,
  }

  // --------------------------------------------------------------------------
  // Step 3: Invoke the Next.js Server Action to update Supabase
  // --------------------------------------------------------------------------
  // `updateCollection` executes a parameterized UPDATE query on the 'collections' table.
  const res = await updateCollection(updatePayload)
  if (res?.error) {
    console.error('Failed to update collection in database:', res.error)
    throw new Error(res.error)
  }

  // --------------------------------------------------------------------------
  // Step 4: Merge updated fields into the existing collection object
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
  // Step 5: Notify parent state listeners
  // --------------------------------------------------------------------------
  // Trigger the parent callback to seamlessly update state across the application
  if (onSuccess) {
    onSuccess(updatedCollection)
  }

  // Return the newly merged collection
  return updatedCollection
}
