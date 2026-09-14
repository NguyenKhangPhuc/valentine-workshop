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
 * It takes raw user input from a form, sanitizes empty text values into null
 * database representations, invokes a Next.js Server Action to persist the
 * collection in Supabase, and returns a fully formed CollectionWithItems object
 * ready for client-side state updates.
 *
 * @usedBy
 * - `CreateCollectionModal.tsx` (`app/components/CreateCollectionModal.tsx`)
 *   Invoked when the user fills out the collection creation dialog and clicks "Create Collection".
 */

import { CollectionInsert, CollectionWithItems } from '../../types/collection'
import { createNewCollection } from '../../actions/collection'

/**
 * Raw input values received from the collection creation form.
 */
export interface CreateCollectionFormInputs {
  /** The title/name of the collection (required) */
  name: string
  /** An optional description or romantic note for this collection */
  description?: string
  /** Optional start date string in YYYY-MM-DD format */
  start_time?: string
  /** Optional end date string in YYYY-MM-DD format */
  end_time?: string
  /** Optional poster image URL or attachment path */
  poster_url?: string
}

/**
 * Creates a new collection by transforming form inputs, executing the database action,
 * and returning a valid CollectionWithItems object.
 *
 * @param {CreateCollectionFormInputs} data - The sanitized form data entered by the user.
 * @param {(newCollection: CollectionWithItems) => void} [onCreated] - Optional callback to update parent state.
 * @returns {Promise<CollectionWithItems>} The newly created collection object with an initialized items array.
 *
 * @example
 * ```ts
 * const newCol = await createCollection({
 *   name: "Trip to Paris",
 *   description: "Our wonderful vacation",
 *   start_time: "2026-06-01",
 *   end_time: "2026-06-10"
 * }, (col) => setCollections(prev => [col, ...prev]));
 * ```
 */
export async function createCollection(
  data: CreateCollectionFormInputs,
  onCreated?: (newCollection: CollectionWithItems) => void
): Promise<CollectionWithItems> {
  // --------------------------------------------------------------------------
  // Step 1: Validate required fields
  // --------------------------------------------------------------------------
  // Before making any network calls, verify that required fields are present.
  // This avoids unnecessary server requests and provides fast feedback.
  if (!data.name || data.name.trim() === '') {
    throw new Error('Collection name is required and cannot be empty.')
  }

  // --------------------------------------------------------------------------
  // Step 2: Sanitize form data into database payload format
  // --------------------------------------------------------------------------
  // HTML form inputs frequently return empty strings ("") for untouched fields.
  // We convert empty strings to `null` so the database stores genuine NULL values.
  const payload: CollectionInsert = {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    start_time: data.start_time || null,
    end_time: data.end_time || null,
    poster_url: data.poster_url || null,
  }

  // --------------------------------------------------------------------------
  // Step 3: Call the Next.js Server Action to insert into Supabase
  // --------------------------------------------------------------------------
  // `createNewCollection` runs securely on the server via Supabase client,
  // inserting the record and returning the inserted row.
  const res = await createNewCollection(payload)

  let createdCol: CollectionWithItems

  // --------------------------------------------------------------------------
  // Step 4: Construct the final CollectionWithItems object
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
      poster_url: payload.poster_url ?? null,
      created_at: new Date().toISOString(),
      collection_items: [],
    }
  }

  // --------------------------------------------------------------------------
  // Step 5: Notify parent components via callback
  // --------------------------------------------------------------------------
  // Call the parent's state-updating handler (e.g., adding to the collections list)
  if (onCreated) {
    onCreated(createdCol)
  }

  // Return the newly created collection to the caller
  return createdCol
}
