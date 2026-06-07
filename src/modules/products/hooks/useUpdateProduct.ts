"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import type { Product } from "../types/product.types";
import type { UpdateProductDto } from "../types/product-dto.types";

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    Error,
    { id: string; dto: UpdateProductDto }
  >({
    mutationFn: ({ id, dto }) => updateProductApi(id, dto),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.adminLists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.adminDetail(id),
      });
      queryClient.invalidateQueries({
        queryKey: productKeys.details(),
      });
      if (data?.slug) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(data.slug),
        });
      }
    },
  });
}
