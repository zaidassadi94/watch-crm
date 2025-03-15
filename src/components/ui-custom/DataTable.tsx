
import { ReactNode } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface Column<T extends object> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: ({ row }: { row: { original: T } }) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyState?: ReactNode;
}

export function DataTable<T extends object>({
  columns,
  data,
  className,
  onRowClick,
  isLoading = false,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`loading-${index}`} className="animate-pulse">
                {columns.map((_, colIndex) => (
                  <TableCell key={`loading-cell-${colIndex}`}>
                    <div className="h-4 bg-muted rounded w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyState || (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                    <p>No results found</p>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow 
                key={index}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
              >
                {columns.map((column, colIndex) => (
                  <TableCell key={`${index}-${colIndex}`} className={column.className}>
                    {column.cell 
                      ? column.cell({ row: { original: item } }) 
                      : column.accessorKey && typeof column.accessorKey === 'string' && column.accessorKey in item
                        ? String((item as any)[column.accessorKey])
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
