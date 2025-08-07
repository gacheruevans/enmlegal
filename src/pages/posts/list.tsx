import { useMemo } from "react";

import {
  useGetLocale,
  useList,
  useTranslate,
} from "@refinedev/core";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  DeleteButton,
  EditButton,
  List,
  NumberField,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";

export const ProductList = () => {
  const { dataGridProps } = useDataGrid();

  const locale = useGetLocale()();

  const translate = useTranslate();

  const { data: categoryData, isLoading: categoryLoading } = useList({
    resource: "categories",
    pagination: {
      mode: "off",
    },
  });

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "name",
        flex: 1,
        headerName: translate("products.fields.name"),
        minWidth: 300,
      },
      {
        field: "category",
        flex: 1,
        headerName: translate("products.fields.category"),
        minWidth: 200,
        valueGetter: ({ row }) => {
          const value = row?.category;
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
        field: "price",
        flex: 1,
        headerName: translate("products.fields.price"),
        minWidth: 100,
        maxWidth: 150,
        display: "flex",
        renderCell: ({ value }) => {
          return (
            <NumberField
              value={value}
              locale={locale}
              options={{ style: "currency", currency: "USD" }}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: translate("table.actions"),
        sortable: false,
        display: "flex",
        renderCell: function render({ row }) {
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
    [categoryLoading, categoryData, locale, translate],
  );

  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} />
    </List>
  );
};