import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ReactNode } from "react"
import type { CommonTableColumn } from "./types"

export function CommonTableTable<T>(props: {
  columns: CommonTableColumn<T>[]
  renderRowActions?: (item: T) => ReactNode
  rowKey: (item: T) => number
  data: T[]
  emptyMessage: string
}) {
  const { columns, renderRowActions, rowKey, data, emptyMessage } = props

  return (
    <div className="overflow-hidden rounded-none border border-border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="w-fit text-left">
            {columns.map((column) => (
              <TableHead key={column.header} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {renderRowActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (renderRowActions ? 1 : 0)}
                className="h-32 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={rowKey(item)}>
                {columns.map((column) => (
                  <TableCell key={column.header} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
                {renderRowActions && <TableCell>{renderRowActions(item)}</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

