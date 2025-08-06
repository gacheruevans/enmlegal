import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";

import { Box, TextField } from "@mui/material";
import { Edit } from "@refinedev/mui";

import type { Category } from "./types";

export const CategoryEdit: React.FC = () => {
  const translate = useTranslate();

  const {
    saveButtonProps,
    register,
    formState: { errors },
  } = useForm<Category, HttpError, Category>();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("id", { valueAsNumber: true })}
          margin="normal"
          fullWidth
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          type="number"
          label={translate("categories.fields.id")}
          name="id"
          disabled
        />
        <TextField
          {...register("title", {
            required: translate("form.required"),
          })}
          error={!!errors?.title}
          helperText={<>{errors?.title?.message}</>}
          margin="normal"
          fullWidth
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          type="text"
          label={translate("categories.fields.title")}
          name="title"
        />
      </Box>
    </Edit>
  );
};