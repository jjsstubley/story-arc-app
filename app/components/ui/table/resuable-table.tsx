import { Table } from "@chakra-ui/react";
import { TableCheckbox } from "./checkbox";

interface TableColumn<T> {
    key: string;
    header: string;
    width?: string | number;
    render: (item: T, index: number) => React.ReactNode;
  }

interface ReusableTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    selection?: {
      selectedIds: string[];
      onSelectionChange: (ids: string[]) => void;
      getId: (item: T) => string;
    };
    setHoveredItemId?: (id: string | null) => void;
    customRowRenderer?: (item: T, index: number, columns: TableColumn<T>[], selection?: {
        selectedIds: string[];
        onSelectionChange: (ids: string[]) => void;
        getId: (item: T) => string;
    }) => React.ReactNode;
  }
  
  export function ReusableTable<T>({ 
    data, 
    columns, 
    selection,
    customRowRenderer,
    setHoveredItemId,
  }: ReusableTableProps<T>) {
    const hasSelection = selection && selection.selectedIds.length > 0;
    const indeterminate = selection && hasSelection && selection.selectedIds.length < data.length;
  
    const defaultRowRenderer = (item: T, index: number) => (
      <Table.Row
        key={selection ? selection.getId(item) : index}
        data-selected={selection?.selectedIds.includes(selection.getId(item)) ? "" : undefined}
        bg="transparent"
        _hover={{ bg: "gray.800" }}
        onMouseEnter={() => {
          console.log('onMouseEnter', item)
          setHoveredItemId?.(selection ? selection.getId(item) : (item as {id: string}).id)
        }}
        onMouseLeave={() => setHoveredItemId?.(null)}
      >
        {selection && (
          <Table.Cell>
            <TableCheckbox
              checked={selection.selectedIds.includes(selection.getId(item))}
              onCheckedChange={(changes) => {
                selection.onSelectionChange(
                  changes.checked
                    ? [...selection.selectedIds, selection.getId(item)]
                    : selection.selectedIds.filter((id) => id !== selection.getId(item)),
                );
              }}
              ariaLabel="Select row"
            />
          </Table.Cell>
        )}
        {columns.map((column) => (
          <Table.Cell key={column.key}>
            {column.render(item, index)}
          </Table.Cell>
        ))}
      </Table.Row>
    );
  
    const renderRow = customRowRenderer || defaultRowRenderer;
  
    return (
      <Table.Root interactive>
        <Table.Header>
            <Table.Row bg="transparent">
            {selection && (
                <Table.ColumnHeader w="6">
                <TableCheckbox
                    checked={indeterminate ? "indeterminate" : (hasSelection ? true : false)}
                    onCheckedChange={(changes) => {
                    selection.onSelectionChange(
                        changes.checked ? data.map(selection.getId) : [],
                    );
                    }}
                    ariaLabel="Select all rows"
                />
                </Table.ColumnHeader>
            )}
            {columns.map((column) => (
                <Table.ColumnHeader key={column.key} >
                {column.header}
                </Table.ColumnHeader>
            ))}
            </Table.Row>
        </Table.Header>
        <Table.Body bg="transparent">
          {data.map((item, index) => renderRow(item, index, columns, selection))}
        </Table.Body>
      </Table.Root>
    );
  }