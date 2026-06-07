export {
  useSubmitContact,
  useContactList,
  useContactDetail,
  useMarkContactAsRead,
  useMarkContactAsReplied,
  useDeleteContact,
  useContactAdmin,
} from "./hooks/contact.hooks";

export { useContactSelectionStore } from "./store/contact.store";

export type {
  CreateContactMessageDto,
  ContactMessage,
  ContactListResponse,
  PaginationMeta,
  ContactActionResponse,
  ContactSortField,
  ContactOrder,
  ContactQueryParams,
  ValidationErrorMap,
} from "./types/contact.types";

export type { ContactSelectionState } from "./store/contact.store";

export {
  CONTACT_LIMITS,
  CONTACT_SORT_FIELDS,
  CONTACT_ENDPOINTS,
  contactKeys,
  setContactTransport,
  getContactTransport,
  validateContactDraft,
  sanitizeContactDraft,
  normalizeContactError,
  parseValidationErrors,
  normalizeSortField,
  normalizeOrder,
  buildContactQueryParams,
  normalizeContactParams,
  toContactMessage,
  browserTransportRequest,
  createBrowserTransport,
  submitContactMessageApi,
  getContactMessagesApi,
  getContactMessageByIdApi,
  markContactAsReadApi,
  markContactAsRepliedApi,
  deleteContactMessageApi,
  invalidateContactLists,
  invalidateContactDetail,
  removeContactDetail,
} from "./api/contact.api";

export { ContactApiError } from "./types/contact.types";
