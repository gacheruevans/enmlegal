import {
  useShow,
  useTranslate,
} from "@refinedev/core";

import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  NumberField,
  Show,
  TextFieldComponent as TextField,
} from "@refinedev/mui";
import type { Category } from "./types";

export const CategoryShow = () => {
  const translate = useTranslate();
  const {
    query: { data: categoryResult, isLoading },
  } = useShow<Category>();

  const category = categoryResult?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold">
          {translate("categories.fields.id")}
        </Typography>
        {category ? (
          <NumberField value={category?.id ?? ""} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
        <Typography variant="body1" fontWeight="bold">
          {translate("categories.fields.title")}
        </Typography>
        {category ? (
          <TextField value={category?.title} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
      </Stack>
    </Show>
  );
};