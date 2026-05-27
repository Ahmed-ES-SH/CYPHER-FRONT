"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import type { MutationResult } from "../types/product-dto.types";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<MutationResult, Error, string>({
    mutationFn: (id) => deleteProductApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.adminDetails(),
      });
    },
  });
}
