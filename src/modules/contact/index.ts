export {
  useSubmitContact,
  useContactList,
  useContactDetail,
  useMarkContactAsRead,
  useMarkContactAsReplied,
  useDeleteContact,
  useContactAdmin,
} from "./contact.hooks";

export {
  useContactSelectionStore,
} from "./contact.store";

export type {
  CreateContactMessageDto,
  ContactMessage,
  ContactListResponse,
  PaginationMeta,
  ContactActionResponse,
  ContactSortField,
  ContactOrder,
  ContactQueryParams,
  ContactApiError,
  ValidationErrorMap,
} from "./contact.types";

export type { ContactSelectionState } from "./contact.store";

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
  toContactMessage,
  submitContactMessageApi,
  getContactMessagesApi,
  getContactMessageByIdApi,
  markContactAsReadApi,
  markContactAsRepliedApi,
  deleteContactMessageApi,
  invalidateContactLists,
  invalidateContactDetail,
  removeContactDetail,
} from "./contact.api";
