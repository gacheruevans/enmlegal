import { type HttpError, useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";

import { Autocomplete, Box, TextField } from "@mui/material";
import { Create, useAutocomplete } from "@refinedev/mui";
import type { Article } from "./types";

export const PostCreate: React.FC = () => {
  const translate = useTranslate();
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    formState: { errors },
  } = useForm<Article, HttpError, Article>();

  const { autocompleteProps: categoryAutocompleteProps } = useAutocomplete({
    resource: "categories",
  });

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("name", {
            required: translate("form.required"),
          })}
          error={!!errors?.name}
          helperText={<>{errors?.name?.message}</>}
          margin="normal"
          fullWidth
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          type="text"
          label={translate("posts.fields.name")}
          name="name"
        />
        <TextField
          {...register("description", {
            required: translate("form.required"),
          })}
          error={!!errors?.description}
          helperText={<>{errors?.description?.message}</>}
          margin="normal"
          fullWidth
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          multiline
          label={translate("posts.fields.description")}
          name="description"
        />
        <Controller
          control={control}
          name="category"
          rules={{ required: translate("form.required") }}
          render={({ field }) => (
            <Autocomplete
              {...categoryAutocompleteProps}
              {...field}
              onChange={(_, value) => {
                field.onChange(value);
              }}
              getOptionLabel={(item) => {
                return (
                  categoryAutocompleteProps?.options?.find(
                    (p) => p?.id?.toString() === item?.id?.toString(),
                  )?.title ?? ""
                );
              }}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={translate("posts.fields.category")}
                  margin="normal"
                  variant="outlined"
                  error={!!errors?.category}
                  helperText={<>{errors?.category?.message}</>}
                  required
                />
              )}
            />
          )}
        />
      </Box>
    </Create>
  );
};