/**
 * ============================================================================
 * Task 1: Create Collection
 * ============================================================================
 *
 * @file task-1.ts
 * @module components/tasks/task-1
 *
 * @description
 * This task handles creating a new memory collection in the application.
 * Form validation (such as ensuring the collection name is provided) is handled
 * declaratively upfront by React Hook Form (`register`, `required`).
 * This function receives the pre-validated form data, constructs the database
 * payload, invokes a Next.js Server Action to persist the collection in Supabase,
 * and returns a fully formed CollectionWithItems object ready for client-side state updates.
 *
 * NOTE: Initial creation does not include a poster image; cover images are uploaded
 * and managed separately via Task 7 (`editCollectionPoster`).
 *
 * @usedBy
 * - `CreateCollectionModal.tsx` (`app/components/CreateCollectionModal.tsx`)
 *   Invoked inside `handleSubmit(onSubmit)` when the user submits the creation form.
 */

import { CollectionInsert, CollectionWithItems } from '../../types/collection'
import { createNewCollection } from '../../actions/collection'

/**
 * Form input values received from the React Hook Form collection creation modal.
 * Upstream validation (e.g. required name) is handled by React Hook Form.
 */
export interface CreateCollectionFormInputs {
  /** The title/name of the collection (required, validated by React Hook Form) */
  name: string
  /** An optional description or romantic note for this collection */
  description?: string
  /** Optional start date string in YYYY-MM-DD format */
  start_time?: string
  /** Optional end date string in YYYY-MM-DD format */
  end_time?: string
}

/**
 * Creates a new collection by mapping form inputs to a database payload, executing
 * the Server Action, and returning a valid CollectionWithItems object.
 *
 * @param {CreateCollectionFormInputs} data - Pre-validated form data from React Hook Form.
 * @param {(newCollection: CollectionWithItems) => void} [onCreated] - Optional callback to update parent state.
 * @param {(message: string) => void} [showNotification] - Optional notification trigger for success and error alerts.
 * @returns {Promise<CollectionWithItems>} The newly created collection object with an initialized items array.
 *
 * @example
 * ```ts
 * const newCol = await createCollection(
 *   { name: "Trip to Paris", start_time: "2026-06-01" },
 *   (col) => setCollections(prev => [col, ...prev]),
 *   showNotification
 * );
 * ```
 */
export async function createCollection(
  data: CreateCollectionFormInputs,
  onCreated?: (newCollection: CollectionWithItems) => void,
  showNotification?: (message: string) => void
): Promise<CollectionWithItems> {
  try {
    // --------------------------------------------------------------------------
    // Step 1: Map form inputs to the database payload
    // --------------------------------------------------------------------------
    // Form validation (such as checking that `name` is not empty) is handled
    // upfront by React Hook Form via `{ required: 'Collection name is required' }`.
    // We map the validated values to the database schema, with `poster_url`
    // initialized to null (cover photos are uploaded via Task 7).
    const payload: CollectionInsert = {
      name: data.name,
      description: data.description || null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      poster_url: null,
    }

    // --------------------------------------------------------------------------
    // Step 2: Call the Next.js Server Action to insert into Supabase
    // --------------------------------------------------------------------------
    // `createNewCollection` runs securely on the server via Supabase client,
    // inserting the record and returning the inserted row.
    const res = await createNewCollection(payload)
    if (res?.error) {
      console.error('Failed to create collection in database:', res.error)
      showNotification?.('Failed to create collection: ' + res.error)
      throw new Error(res.error)
    }

    let createdCol: CollectionWithItems

    // --------------------------------------------------------------------------
    // Step 3: Construct the final CollectionWithItems object
    // --------------------------------------------------------------------------
    // If the server action succeeded and returned the persisted row:
    if (res?.data) {
      // Attach an empty `collection_items` array to satisfy the CollectionWithItems type
      createdCol = {
        ...res.data,
        collection_items: [],
      }
    } else {
      // Fallback: If running offline or in demo mode without a configured DB,
      // construct an optimistic mock object with a generated timestamp ID.
      console.warn('Server insertion did not return data. Generating client fallback:', res?.error)
      createdCol = {
        id: 'col-' + Date.now(),
        name: payload.name ?? null,
        description: payload.description ?? null,
        start_time: payload.start_time ?? null,
        end_time: payload.end_time ?? null,
        poster_url: null,
        created_at: new Date().toISOString(),
        collection_items: [],
      }
    }

    // --------------------------------------------------------------------------
    // Step 4: Trigger success notification and notify parent components
    // --------------------------------------------------------------------------
    showNotification?.('Collection created successfully!')

    if (onCreated) {
      onCreated(createdCol)
    }

    // Return the newly created collection to the caller
    return createdCol
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to create collection.'
    showNotification?.(errorMsg)
    throw error
  }
}
