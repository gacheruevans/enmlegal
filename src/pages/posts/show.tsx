import { useOne, useShow, useTranslate } from "@refinedev/core"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import {
  NumberField,
  Show,
  TextFieldComponent as TextField,
} from "@refinedev/mui"
import type { Article } from "./types"

export const PostShow: React.FC = () => {
  const translate = useTranslate();
  const {
    query: { data: postResult, isLoading },
  } = useShow<Article>();

  const post = postResult?.data;

  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useOne({
    resource: "categories",
    id: post?.category?.id,
    queryOptions: {
      enabled: !!post?.category?.id,
    },
  });

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold">
          {translate("posts.fields.id")}
        </Typography>
        {post ? (
          <NumberField value={post.id} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
        <Typography variant="body1" fontWeight="bold">
          {translate("posts.fields.name")}
        </Typography>
        {post ? (
          <TextField value={post.name} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
        <Typography variant="body1" fontWeight="bold">
          {translate("posts.fields.description")}
        </Typography>
        {post ? (
          <TextField value={post.description} />
        ) : (
          <Skeleton height="20px" width="200px" />
        )}
        <Typography variant="body1" fontWeight="bold">
          {translate("posts.fields.price")}
        </Typography>
       
        <Typography variant="body1" fontWeight="bold">
          {translate("posts.fields.material")}
        </Typography>

        <Typography variant="body1" fontWeight="bold">
          {translate("posts.fields.category")}
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