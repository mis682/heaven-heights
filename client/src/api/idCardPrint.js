import { apiOrigin } from "./client";

// Separate from api/maintenanceStaff.js on purpose — this only builds a
// download URL, it never touches the existing staff management API calls.
export const printIdCardsUrl = (ids) => `${apiOrigin}/api/print-id-cards?ids=${ids.join(",")}`;
