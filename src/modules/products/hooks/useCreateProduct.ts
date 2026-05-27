"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductApi } from "../api/products.api";
import { productKeys } from "../constants/products.keys";
import type { Product } from "../types/product.types";
import type { CreateProductDto } from "../types/product-dto.types";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateProductDto>({
    mutationFn: (dto) => createProductApi(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.adminLists() });
    },
  });
}
