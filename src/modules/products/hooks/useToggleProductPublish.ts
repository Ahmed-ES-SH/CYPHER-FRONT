"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleProductPublishApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import type { PublishToggleResult } from "../types/product-dto.types";

export function useToggleProductPublish() {
  const queryClient = useQueryClient();

  return useMutation<PublishToggleResult, Error, string>({
    mutationFn: (id) => toggleProductPublishApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
