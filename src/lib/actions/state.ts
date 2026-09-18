/**
 * The reply every form in the app gets back. Kept apart from the server-only
 * helpers in `shared.ts` so a Client Component can import the initial state
 * without pulling server code into the browser bundle.
 */
export interface FormState {
  error?: string;
  ok?: boolean;
}

export const emptyFormState: FormState = {};
