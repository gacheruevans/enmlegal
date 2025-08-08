import { useMemo } from "react";

import {
  useList,
  useTranslate,
} from "@refinedev/core"

import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui"
import type { Article } from "./types"

export const PostList = () => {
  const { dataGridProps } = useDataGrid<Article>();

  const translate = useTranslate();

  const { data: categoryData, isLoading: categoryLoading } = useList({
    resource: "categories",
    pagination: {
      mode: "off",
    },
  });

  const columns = useMemo<GridColDef<Article>[]>(
    () => [
      {
        field: "name",
        flex: 1,
        headerName: translate("posts.fields.name"),
        minWidth: 300,
      },
      {
        field: "category",
        flex: 1,
        headerName: translate("posts.fields.category"),
        minWidth: 200,
        valueGetter: ({ row }: { row: Article }) => {
          const value = row.category;
          return value;
        },
        display: "flex",
        renderCell: function render({ value }) {
          return categoryLoading ? (
            <>{translate("loading")}</>
          ) : (
            categoryData?.data?.find((item) => item.id === value?.id)?.title ??
              null
          );
        },
      },
      {
        field: "actions",
        headerName: translate("table.actions"),
        sortable: false,
        display: "flex",
        renderCell: function render({ row }: { row: Article }) {
          return (
            <>
              <ShowButton hideText recordItemId={row.id} />
              <EditButton hideText recordItemId={row.id} />
              <DeleteButton hideText recordItemId={row.id} />
            </>
          );
        },
        align: "center",
        headerAlign: "center",
        minWidth: 80,
      },
    ],
    [categoryLoading, categoryData, translate],
  );

  return (
    <List>
      <DataGrid
        {...dataGridProps}
        columns={columns}
        getRowId={(row: Article) => row.id}
      />
    </List>
  );
};