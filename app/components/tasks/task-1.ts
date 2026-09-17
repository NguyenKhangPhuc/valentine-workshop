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
    /**
     * --------------------------------------------------------------------------
     * Step 1: Map form inputs to database payload
     * --------------------------------------------------------------------------
     * Specification:
     * - Form validation (ensuring name is present) is handled upfront by React Hook Form.
     * - Map pre-validated form inputs to the `CollectionInsert` database schema.
     * - Convert empty/undefined strings to `null` for clean database storage.
     * - Initialize `poster_url` to `null` (cover photos are uploaded via Task 7).
     */
    // Map form inputs to database fields; set poster_url to null initially.
    const payload: CollectionInsert = {
      // Assign the validated collection name.
      name: data.name,
      // Provide optional description or fallback to null.
      description: data.description || null,
      // Provide optional start date or fallback to null.
      start_time: data.start_time || null,
      // Provide optional end date or fallback to null.
      end_time: data.end_time || null,
      // Initialize cover photo as null (managed via Task 7).
      poster_url: null,
    }

    /**
     * --------------------------------------------------------------------------
     * Step 2: Persist collection to Supabase via Server Action
     * --------------------------------------------------------------------------
     * Specification:
     * - Invoke `createNewCollection(payload)` running securely on the server.
     * - Check for server errors; log to console, trigger user toast notification,
     *   and throw an Error to abort on failure.
     */
    // Call server action createNewCollection to persist the collection row in Supabase.
    const res = await createNewCollection(payload)

    // Check if the server returned an error during creation.
    if (res?.error) {
      // Log server error details to the console for debugging.
      console.error('Failed to create collection in database:', res.error)
      // Notify the user of the creation failure via toast notification.
      showNotification?.('Failed to create collection: ' + res.error)
      // Throw error to interrupt execution and enter catch block.
      throw new Error(res.error)
    }

    /**
     * --------------------------------------------------------------------------
     * Step 3: Construct collection object, trigger notifications, and notify parent state
     * --------------------------------------------------------------------------
     * Specification:
     * - If the database record succeeds, attach empty `collection_items: []` to satisfy `CollectionWithItems`.
     * - If offline/demo mode without DB data, generate an optimistic fallback with a timestamp ID.
     * - Display a success toast notification via `showNotification`.
     * - Invoke the `onCreated` callback with the new collection if provided.
     * - Return the created `CollectionWithItems` object to the caller.
     */
    // Declare variable to hold the final created collection object.
    let createdCol: CollectionWithItems

    // Check if the database record was returned successfully.
    if (res?.data) {
      // Attach an empty items array to satisfy the CollectionWithItems type.
      createdCol = {
        ...res.data,
        collection_items: [],
      }
    } else {
      // Log warning when server returns no data (e.g., local mock or offline mode).
      console.warn('Server insertion did not return data. Generating client fallback:', res?.error)
      // Construct fallback optimistic collection with a timestamp-based ID.
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

    // Display a success toast notification to the user.
    showNotification?.('Collection created successfully!')

    // Check if an onCreated callback was supplied by the caller.
    if (onCreated) {
      // Invoke callback to pass the new collection to parent state.
      onCreated(createdCol)
    }

    // Return the newly created collection object.
    return createdCol
  } catch (error) {
    // Extract error message string or provide a fallback error text.
    const errorMsg = error instanceof Error ? error.message : 'Failed to create collection.'
    // Show error notification toast with the failure reason.
    showNotification?.(errorMsg)
    // Re-throw error so calling components can handle form state accordingly.
    throw error
  }
}
