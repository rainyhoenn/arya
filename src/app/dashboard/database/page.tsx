"use client"

import * as React from "react"
import { ConrodItem } from "@/lib/types"
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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AddConrodDialog } from "@/components/add-conrod-dialog"
import { EditConrodDialog } from "@/components/edit-conrod-dialog"


const getColumns = (
  handleEditItem: () => void,
  handleDeleteItem: (id: number) => void
): ColumnDef<ConrodItem>[] => [
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
    accessorKey: "serialNumber",
    header: ({ column }) => {
      return (
        <div className="w-24">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center p-2"
          >
            Serial No.
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => <div className="w-24 font-medium text-center">{row.getValue("serialNumber")}</div>,
    size: 100,
  },
  {
    accessorKey: "conrodName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Conrod Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const item = row.original
      return (
        <div>
          <div className="font-medium">{item.conrodName}</div>
          <div className="text-sm text-muted-foreground">
            {item.conrodVariant}, {item.conrodSize}
          </div>
        </div>
      )
    },
  },
  {
    id: "dimensions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dimensions
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="text-sm">
          <div>Small End: {item.smallEndDiameter ? `${item.smallEndDiameter}mm` : '0mm'}</div>
          <div>Big End: {item.bigEndDiameter ? `${item.bigEndDiameter}mm` : '0mm'}</div>
          <div>Center Distance: {item.centerDistance ? `${item.centerDistance}mm` : '0mm'}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "pinName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pin Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const item = row.original
      return (
        <div>
          <div className="font-medium">{item.pinName}</div>
          <div className="text-sm text-muted-foreground">Size: {item.pinSize}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "ballBearingName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ball Bearing Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const item = row.original
      return (
        <div>
          <div className="font-medium">{item.ballBearingName}</div>
          <div className="text-sm text-muted-foreground">
            {item.ballBearingVariant}, {item.ballBearingSize}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="text-center font-medium">{item.amount ? item.amount : "N/A"}</div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <EditConrodDialog item={item} onEditConrod={handleEditItem}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit item
              </DropdownMenuItem>
            </EditConrodDialog>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => handleDeleteItem(item.id)}
            >
              Delete item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function DatabasePage() {
  const [data, setData] = React.useState<ConrodItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [isImporting, setIsImporting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const fetchConrods = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/conrods")
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch conrods")
      }
      
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch conrods")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddConrod = () => {
    fetchConrods() // Refresh data after adding
  }

  const handleEditItem = () => {
    fetchConrods() // Refresh data after editing
  }

  const handleDeleteItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/conrods/${itemId}`, {
        method: "DELETE",
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete item")
      }
      
      // Refresh the data
      fetchConrods()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item")
    }
  }

  const parseCSV = (csvText: string): ConrodItem[] => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const item: any = {}
      
      headers.forEach((header, i) => {
        const value = values[i] || ''
        
        // Map CSV headers to ConrodItem properties
        switch (header.toLowerCase()) {
          case 'serial number':
          case 'serialnumber':
            item.serialNumber = value
            break
          case 'conrod name':
          case 'conrodname':
            item.conrodName = value
            break
          case 'conrod variant':
          case 'conrodvariant':
            item.conrodVariant = value
            break
          case 'conrod size':
          case 'conrodsize':
            item.conrodSize = value
            break
          case 'small end diameter':
          case 'smallenddiameter':
            item.smallEndDiameter = value ? parseFloat(value) || 0 : 0
            break
          case 'big end diameter':
          case 'bigenddiameter':
            item.bigEndDiameter = value ? parseFloat(value) || 0 : 0
            break
          case 'center distance':
          case 'centerdistance':
            item.centerDistance = value ? parseFloat(value) || 0 : 0
            break
          case 'pin name':
          case 'pinname':
            item.pinName = value
            break
          case 'pin size':
          case 'pinsize':
            item.pinSize = value
            break
          case 'ball bearing name':
          case 'ballbearingname':
            item.ballBearingName = value
            break
          case 'ball bearing variant':
          case 'ballbearingvariant':
            item.ballBearingVariant = value
            break
          case 'ball bearing size':
          case 'ballbearingsize':
            item.ballBearingSize = value
            break
          case 'amount':
            item.amount = parseInt(value) || undefined
            break
        }
      })
      
      // Generate a temporary ID for new items
      item.id = Date.now() + index
      
      return item as ConrodItem
    }).filter(item => item.serialNumber && item.conrodName) // Filter out incomplete rows
  }

  const handleImportCSV = async (file: File) => {
    try {
      setIsImporting(true)
      setError(null)
      
      const text = await file.text()
      const parsedData = parseCSV(text)
      
      if (parsedData.length === 0) {
        throw new Error("No valid data found in the file")
      }
      
      // Send bulk import request to API
      const response = await fetch("/api/conrods/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conrods: parsedData }),
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to import data")
      }
      
      // Refresh the data
      await fetchConrods()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import CSV")
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      if (fileExtension === 'csv' || fileExtension === 'xlsx' || fileExtension === 'xls') {
        handleImportCSV(file)
      } else {
        setError("Please select a CSV or Excel file")
      }
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  React.useEffect(() => {
    fetchConrods()
  }, [])

  const columns = getColumns(handleEditItem, handleDeleteItem)

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
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
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
        <SiteHeader 
          title="Database" 
          actions={
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={triggerFileSelect}
                disabled={isImporting}
              >
                {isImporting ? "Importing..." : "Import CSV"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <AddConrodDialog onAddConrod={handleAddConrod}>
                <Button size="sm">
                  Add Conrod Database
                </Button>
              </AddConrodDialog>
            </div>
          }
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                
                <div className="w-full space-y-4 py-4">
                  <div className="flex items-center">
                    <Input
                      placeholder="Filter conrods..."
                      value={(table.getColumn("conrodName")?.getFilterValue() as string) ?? ""}
                      onChange={(event) =>
                        table.getColumn("conrodName")?.setFilterValue(event.target.value)
                      }
                      className="max-w-sm"
                    />
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
                              Loading conrods...
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
                              No conrods found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                      {table.getFilteredSelectedRowModel().rows.length} of{" "}
                      {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => table.previousPage()}
                            className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((page) => {
                          const currentPage = table.getState().pagination.pageIndex + 1;
                          const totalPages = table.getPageCount();
                          
                          // Show first page, last page, current page, and pages around current page
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => table.setPageIndex(page - 1)}
                                  isActive={page === currentPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => table.nextPage()}
                            className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
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