import { useOne, useShow, useTranslate } from "@refinedev/core";

import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  NumberField,
  Show,
  TextFieldComponent as TextField,
} from "@refinedev/mui";
import type { Product } from "./types";

export const ProductShow: React.FC = () => {
  const translate = useTranslate();
  const {
    query: { data: productResult, isLoading },
  } = useShow<Product>();

  const product = productResult?.data;

  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useOne({
    resource: "categories",
    id: product?.category?.id,
    queryOptions: {
      enabled: !!product?.category?.id,
    },
  });

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold">
          {translate("products.fields.id")}
        </Typography>
        {product ? (
          <NumberField value={product.id} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
        <Typography variant="body1" fontWeight="bold">
          {translate("products.fields.name")}
        </Typography>
        {product ? (
          <TextField value={product.name} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
        <Typography variant="body1" fontWeight="bold">
          {translate("products.fields.description")}
        </Typography>
        {product ? (
          <TextField value={product.description} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
        <Typography variant="body1" fontWeight="bold">
          {translate("products.fields.price")}
        </Typography>
        {product ? (
          <NumberField value={product.price} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
        <Typography variant="body1" fontWeight="bold">
          {translate("products.fields.material")}
        </Typography>
        {product ? (
          <TextField value={product.material} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
        <Typography variant="body1" fontWeight="bold">
          {translate("products.fields.category")}
        </Typography>
        {categoryError ? null : categoryLoading ? (
          <Skeleton height="20px" width="200px" />
        ) : (
          <TextField value={categoryData?.data?.title} />
        )}
      </Stack>
    </Show>
  );
};