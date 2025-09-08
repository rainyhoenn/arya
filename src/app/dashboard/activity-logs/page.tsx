"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Filter, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export type ActivityLogItem = {
  id: number
  action: string
  module: 'pre-production' | 'conrod-assembly' | 'billing'
  entityId?: number
  entityName?: string
  description: string
  details?: string
  userId?: string
  createdAt: string
}

const getActionColor = (action: string) => {
  switch (action.toUpperCase()) {
    case 'CREATE':
      return 'bg-green-500'
    case 'UPDATE':
      return 'bg-blue-500'
    case 'DELETE':
      return 'bg-red-500'
    case 'DEDUCT':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
}

const getModuleColor = (module: string) => {
  switch (module) {
    case 'pre-production':
      return 'bg-purple-100 text-purple-800'
    case 'conrod-assembly':
      return 'bg-blue-100 text-blue-800'
    case 'billing':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getColumns = (): ColumnDef<ActivityLogItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const timestamp = new Date(row.getValue("createdAt"))
      return (
        <div className="flex flex-col">
          <div className="font-medium">{timestamp.toLocaleDateString()}</div>
          <div className="text-sm text-muted-foreground">{timestamp.toLocaleTimeString()}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "action",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Action
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const action = row.getValue("action") as string
      return (
        <Badge className={`${getActionColor(action)} text-white`}>
          {action}
        </Badge>
      )
    },
  },
  {
    accessorKey: "module",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Module
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const module = row.getValue("module") as string
      return (
        <Badge className={getModuleColor(module)}>
          {module.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      )
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const item = row.original
      return (
        <div>
          <div className="font-medium">{item.description}</div>
          {item.entityName && (
            <div className="text-sm text-muted-foreground">Entity: {item.entityName}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      const details = row.getValue("details") as string
      return details ? (
        <div className="text-sm text-muted-foreground max-w-xs truncate" title={details}>
          {details}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
]

export default function ActivityLogsPage() {
  const [data, setData] = React.useState<ActivityLogItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [moduleFilter, setModuleFilter] = React.useState<string>("")

  const fetchActivityLogs = async (module?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const url = module && module !== "all" ? `/api/activity-logs?module=${module}` : "/api/activity-logs"
      const response = await fetch(url)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch activity logs")
      }
      
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch activity logs")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchActivityLogs(moduleFilter)
  }, [moduleFilter])

  const columns = getColumns()

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Activity Logs" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                

                <div className="w-full space-y-4 py-4">
                  <div className="flex items-center gap-2">
                      <Input
                        placeholder="Filter activities..."
                        value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                          table.getColumn("description")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Module: {moduleFilter || "All"}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Filter by Module</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setModuleFilter("")}>
                            All Modules
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setModuleFilter("pre-production")}>
                            Pre-Production
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setModuleFilter("conrod-assembly")}>
                            Conrod Assembly
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setModuleFilter("billing")}>
                            Billing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                              return (
                                <TableHead key={header.id}>
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center"
                            >
                              <div className="flex items-center justify-center">
                                <Activity className="mr-2 h-4 w-4 animate-spin" />
                                Loading activity logs...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center text-destructive"
                            >
                              Error: {error}
                            </TableCell>
                          </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center"
                            >
                              No activity logs found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                      {table.getFilteredSelectedRowModel().rows.length} of{" "}
                      {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}