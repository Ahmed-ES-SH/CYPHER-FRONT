"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateContactMessageDto,
  ContactMessage,
  ContactListResponse,
  ContactActionResponse,
  ContactQueryParams,
} from "../types/contact.types";
import {
  submitContactMessageApi,
  getContactMessagesApi,
  getContactMessageByIdApi,
  markContactAsReadApi,
  markContactAsRepliedApi,
  deleteContactMessageApi,
  contactKeys,
  invalidateContactLists,
  invalidateContactDetail,
  removeContactDetail,
} from "../api/contact.api";
import { useContactSelectionStore } from "../store/contact.store";

/* =========================================================
   Cache Defaults
   ========================================================= */

const CONTACT_STALE_TIME = 5 * 60 * 1000;
const CONTACT_GC_TIME = 30 * 60 * 1000;
const CONTACT_RETRY = 1;

/* =========================================================
   useSubmitContact
   ========================================================= */

export function useSubmitContact() {
  const queryClient = useQueryClient();

  return useMutation<ContactActionResponse, Error, CreateContactMessageDto>({
    mutationFn: (dto) => submitContactMessageApi(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.mutations() });
    },
  });
}

/* =========================================================
   useContactList
   ========================================================= */

export function useContactList(
  params: ContactQueryParams = {},
  options?: Partial<Parameters<typeof useQuery>[0]>,
) {
  return useQuery<ContactListResponse>({
    queryKey: contactKeys.list(params),
    queryFn: () => getContactMessagesApi(params),
    staleTime: CONTACT_STALE_TIME,
    gcTime: CONTACT_GC_TIME,
    retry: CONTACT_RETRY,
    ...options,
  });
}

/* =========================================================
   useContactDetail
   ========================================================= */

export function useContactDetail(
  id: string | undefined,
  options?: Partial<Parameters<typeof useQuery>[0]>,
) {
  return useQuery<ContactMessage>({
    queryKey: contactKeys.detail(id ?? ""),
    queryFn: () => getContactMessageByIdApi(id!),
    enabled: !!id,
    staleTime: CONTACT_STALE_TIME,
    gcTime: CONTACT_GC_TIME,
    retry: CONTACT_RETRY,
    ...options,
  });
}

/* =========================================================
   useMarkContactAsRead
   ========================================================= */

export function useMarkContactAsRead() {
  const queryClient = useQueryClient();

  return useMutation<ContactActionResponse, Error, string>({
    mutationFn: (id) => markContactAsReadApi(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
      invalidateContactLists(queryClient);
    },
  });
}

/* =========================================================
   useMarkContactAsReplied
   ========================================================= */

export function useMarkContactAsReplied() {
  const queryClient = useQueryClient();

  return useMutation<ContactActionResponse, Error, string>({
    mutationFn: (id) => markContactAsRepliedApi(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
      invalidateContactLists(queryClient);
    },
  });
}

/* =========================================================
   useDeleteContact
   ========================================================= */

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation<ContactActionResponse, Error, string>({
    mutationFn: (id) => deleteContactMessageApi(id),
    onSuccess: (_data, id) => {
      removeContactDetail(queryClient, id);
      invalidateContactLists(queryClient);
    },
  });
}

/* =========================================================
   useContactAdmin
   ========================================================= */

export function useContactAdmin(params: ContactQueryParams = {}) {
  const list = useContactList(params);
  const selectedContactId = useContactSelectionStore((state) => state.selectedContactId);
  const setSelectedContactId = useContactSelectionStore((state) => state.setSelectedContactId);

  const detail = useContactDetail(selectedContactId ?? undefined);
  const markAsRead = useMarkContactAsRead();
  const markAsReplied = useMarkContactAsReplied();
  const deleteMessage = useDeleteContact();

  return {
    messages: list.data?.data ?? [],
    meta: list.data?.meta,
    isLoading: list.isPending,
    isError: list.isError,
    error: list.error,
    refetch: list.refetch,

    selectedContactId,
    setSelectedContactId,
    detail: detail.data,
    isDetailLoading: detail.isLoading,
    markAsRead: markAsRead.mutate,
    markAsReplied: markAsReplied.mutate,
    deleteMessage: deleteMessage.mutate,
  };
}
