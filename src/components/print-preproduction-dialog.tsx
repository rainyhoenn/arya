"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type PreProductionItem = {
  id: number
  name: string
  type: string
  size?: string
  variant?: string
  quantity: number
  dateUpdated: string
  createdAt?: string
}

interface PrintPreProductionDialogProps {
  items: PreProductionItem[]
  children: React.ReactNode
}

export function PrintPreProductionDialog({ items, children }: PrintPreProductionDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  // Get unique types from items
  const availableTypes = React.useMemo(() => {
    const types = new Set(items.map(item => item.type))
    return Array.from(types).sort()
  }, [items])

  // Get filtered items based on selected type and quantity > 0
  const filteredItems = React.useMemo(() => {
    if (!selectedType) return []
    return items.filter(item => item.type === selectedType && item.quantity > 0)
  }, [items, selectedType])

  const handlePrint = () => {
    if (!selectedType || filteredItems.length === 0) return

    setIsLoading(true)

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Generate HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pre-Production Items - ${selectedType}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .quantity {
              text-align: center;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Pre-Production Items</h1>
            <p>Type: ${selectedType}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Total Items: ${filteredItems.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Name</th>
                ${selectedType !== 'Conrod' ? '<th>Size</th>' : ''}
                ${selectedType !== 'Conrod' ? '<th>Variant</th>' : ''}
                <th>Quantity</th>
                <th>Date Updated</th>
              </tr>
            </thead>
            <tbody>
              ${filteredItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  ${selectedType !== 'Conrod' ? `<td>${item.size || 'N/A'}</td>` : ''}
                  ${selectedType !== 'Conrod' ? `<td>${item.variant || 'N/A'}</td>` : ''}
                  <td class="quantity">${item.quantity.toLocaleString()}</td>
                  <td>${item.dateUpdated}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Total Quantity: ${filteredItems.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait a moment for content to load, then print
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
      setIsLoading(false)
      setOpen(false)
    }, 500)
  }

  const handleReset = () => {
    setSelectedType("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Print Pre-Production Items</DialogTitle>
          <DialogDescription>
            Select a type to print all items with quantity greater than 0.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Item Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type to print" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="rounded-md border p-3 bg-muted/50">
              <p className="text-sm font-medium">Preview:</p>
              <p className="text-sm text-muted-foreground">
                {filteredItems.length} {selectedType} items with quantity &gt; 0
              </p>
              {filteredItems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total quantity: {filteredItems.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
          >
            Reset
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="button"
            onClick={handlePrint}
            disabled={!selectedType || filteredItems.length === 0 || isLoading}
          >
            {isLoading ? "Printing..." : "Print Items"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}