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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Printer } from "lucide-react"

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
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export type InvoiceItem = {
  id: number
  productName: string
  quantity: number
}

export type Invoice = {
  id: number
  invoiceNo: string
  customerId: number
  customerName: string
  totalAmount: number
  status: 'draft' | 'paid' | 'cancelled'
  createdAt: string
  transport?: string
  customerGstNo?: string
  customerPhoneNumber?: string
  items?: InvoiceItem[]
}

const getColumns = (
  handlePrintInvoice: (invoice: Invoice) => void,
  handlePrintBill: (invoice: Invoice) => void
): ColumnDef<Invoice>[] => [
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
    accessorKey: "invoiceNo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("invoiceNo")}</div>
    ),
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div>{row.getValue("customerName")}</div>
    ),
  },
  {
    id: "products",
    header: "Products & Quantity",
    cell: ({ row }) => {
      const invoice = row.original
      if (!invoice.items || invoice.items.length === 0) {
        return <div className="text-muted-foreground">No items</div>
      }
      return (
        <div className="space-y-1">
          {invoice.items.map((item, index) => (
            <div key={item.id || index} className="text-sm">
              <div className="font-medium">{item.productName}</div>
              <div className="text-muted-foreground">Qty: {item.quantity}</div>
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <div className="w-32 text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Total Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      return (
        <div className="w-32 text-center font-medium">
          ₹{amount.toFixed(2)}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="w-28 text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-center"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div className="w-28 text-center">{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const invoice = row.original

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
            <DropdownMenuItem onClick={() => handlePrintInvoice(invoice)}>
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrintBill(invoice)}>
              <Printer className="mr-2 h-4 w-4" />
              Print Bill
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Function to convert number to words in Indian system
const numberToWordsIndian = (num: number): string => {
  if (num === 0) return "Zero"
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  
  const convertHundreds = (n: number): string => {
    let result = ""
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred "
      n %= 100
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " "
      n %= 10
    } else if (n >= 10) {
      result += teens[n - 10] + " "
      return result
    }
    if (n > 0) {
      result += ones[n] + " "
    }
    return result
  }
  
  let result = ""
  
  // Crores
  if (num >= 10000000) {
    result += convertHundreds(Math.floor(num / 10000000)) + "Crore "
    num %= 10000000
  }
  
  // Lakhs
  if (num >= 100000) {
    result += convertHundreds(Math.floor(num / 100000)) + "Lakh "
    num %= 100000
  }
  
  // Thousands
  if (num >= 1000) {
    result += convertHundreds(Math.floor(num / 1000)) + "Thousand "
    num %= 1000
  }
  
  // Hundreds, tens, and ones
  if (num > 0) {
    result += convertHundreds(num)
  }
  
  return result.trim()
}

const amountToWordsIndian = (amount: number): string => {
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  
  let result = ""
  
  if (rupees > 0) {
    result += numberToWordsIndian(rupees) + " Rupees"
  }
  
  if (paise > 0) {
    if (rupees > 0) result += " and "
    result += numberToWordsIndian(paise) + " Paise"
  }
  
  if (rupees === 0 && paise === 0) {
    result = "Zero Rupees"
  }
  
  return result + " Only"
}

export default function BillingHistoryPage() {
  const [data, setData] = React.useState<Invoice[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/invoices")
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch invoices")
      }
      
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch invoices")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintInvoice = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-GB')
    const subTotal = invoice.totalAmount
    const cgst = subTotal * 0.14 // 14% CGST
    const sgst = subTotal * 0.14 // 14% SGST
    const grandTotal = subTotal + cgst + sgst
    const invoiceNo = invoice.invoiceNo
    const amountInWords = amountToWordsIndian(grandTotal)

    const html = `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - The Globe Stores Co.</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 20px; 
      background-color: #f8f8f8; 
    }
    .invoice-box { 
      max-width: 800px; 
      margin: auto; 
      padding: 0; 
      background-color: white; 
      border: 1.5px solid #000; /* Thicker outer border */
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    td { 
      padding: 4px; 
      vertical-align: top; 
      font-size: 12px; 
      border: 0.5px solid #000; /* Thinner inner borders */
    }
    
    /* Main items table outer border and header separators */
    .main-table {
      border: 1px solid #000;
      margin-top: -1px;
    }
    .main-table tr:first-child td {
      border-bottom: 1px solid #000; /* Header bottom line */
    }
    .company-name { 
      font-size: 22px; 
      font-weight: bold; 
      color: #1a3c78; 
      margin-bottom: 2px; 
      letter-spacing: 1px; 
    }
    .tax-invoice { 
      font-size: 14px; 
      font-weight: bold; 
      color: #1a3c78; 
      text-align: center; 
      margin-bottom: 5px;
      text-decoration: underline; 
    }
    .jurisdiction { 
      font-size: 10px; 
      color: #1a3c78; 
      padding: 2px 0; 
      text-align: center; 
      font-weight: bold; 
    }
    .company-details { 
      font-size: 11px; 
      color: #1a3c78; 
    }
    .logo { 
      float: left;
      width: 100px; 
      margin-right: 10px; 
    }
    .tagline { 
      color: #1a3c78; 
      font-weight: bold; 
      font-size: 12px; 
      margin-top: 5px;
    }
    .business-type { 
      color: #1a3c78; 
      font-size: 11px; 
    }
    .description-header {
      letter-spacing: 3px;
      text-align: center;
    }
    .footer-signature { 
      text-align: right; 
      vertical-align: bottom; 
      font-size: 11px; 
      padding-right: 10px; 
    }
    .eo-text { 
      font-size: 10px; 
      padding-left: 5px; 
      text-align: left; 
    }
    .section-header {
      font-size: 11px;
      color: #1a3c78;
    }
    @media print {
      body { margin: 0; background-color: white; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="tax-invoice">TAX INVOICE</div>
    
    <!-- Header Section -->
    <table>
      <tr>
        <td style="width: 65%; vertical-align: top; padding: 10px; border-right: none;">
          <div style="display: flex;">
            <div class="logo" style="width: 120px; margin-right: 10px;">
              <img src="/image.png" alt="Logo" style="width: 100%; height: 100%;" />
            </div>
            <div>
              <div class="company-name">THE GLOBE STORES CO.</div>
              <div class="company-details">4-D Block, Greenstone Heritage, D. N. Road, Mumbai - 400 001.</div>
              <div class="company-details">Mob.: 98201 25895 • Email: sarangtagare@gmail.com</div>
              <div class="company-details">GSTIN: 27AABFT4424E1ZG</div>
            </div>
          </div>
          
          <div class="tagline">QUALITY TRUST EXCELLENCE</div>
          <div class="business-type">Dealers & Exporters: Two / Three Wheeler Spares & Accessories</div>
        </td>
        
        <td style="width: 35%; padding: 0; vertical-align: top; border-left: none;">
          <div class="jurisdiction" style="border-bottom: 1px solid #000;">SUBJECT TO MUMBAI JURISDICTION</div>
          
          <!-- Invoice no and date -->
          <table style="border-collapse: collapse; margin: 0;">
            <tr>
              <td style="width: 60%; border-right: 1px solid #000;">INVOICE NO.</td>
              <td style="width: 40%">${invoiceNo}</td>
            </tr>
            <tr>
              <td style="height: 20px; border-right: 1px solid #000;">DATE</td>
              <td style="height: 20px;">${dateStr}</td>
            </tr>
          </table>
          
          <!-- Order no and date -->
          <table style="border-collapse: collapse; margin: 0; border-top: none;">
            <tr>
              <td style="width: 60%; border-right: 1px solid #000; border-top: 1px solid #000;">YOUR ORDER NO.</td>
              <td style="width: 40%; border-top: 1px solid #000;">DATE</td>
            </tr>
            <tr>
              <td style="height: 20px; border-right: 1px solid #000;"></td>
              <td style="height: 20px;"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Customer/Address Section with Packing & Documents -->
    <table style="border-collapse: collapse; margin-top: -1px;">
      <tr>
        <td style="width: 65%; height: 120px;"></td>
        <td style="width: 35%; vertical-align: top; padding: 10px; border-left: none;">
          <div style="font-size: 13px; margin-top: 8px;">
            <div><strong>Invoice No. : </strong>${invoiceNo}</div>
            <div><strong>Dated : </strong>${dateStr}</div>
          </div>

          <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 8px;">
            <div style="margin-bottom: 5px;"><strong>${invoice.customerName}</strong></div>
            <div>
              [Customer Address]<br>
              ${invoice.customerGstNo ? `<strong>GST No.: </strong>${invoice.customerGstNo}<br>` : ''}
              ${invoice.customerPhoneNumber ? `<strong>Phone No.: </strong>${invoice.customerPhoneNumber}` : ''}
            </div>
          </div>
        </td>
      </tr>
    </table>
    
    <!-- Transport Section -->
    <table style="border-collapse: collapse; margin-top: -1px;">
      <tr>
        <td style="width: 15%;" class="section-header">TRANSPORTER</td>
        <td style="width: 50%;">${invoice.transport || ''}</td>
        <td style="width: 10%; text-align: center;" class="section-header">LR./RR.<br>NO.</td>
        <td style="width: 25%;"></td>
      </tr>
    </table>
    
    <!-- Items Table -->
    <table class="main-table">
      <tr>
        <td style="width: 5%; text-align: center;" class="section-header">SR.<br>NO.</td>
        <td style="width: 10%; text-align: center;" class="section-header">PART<br>NO.</td>
        <td style="width: 40%;" class="description-header section-header">D E S C R I P T I O N</td>
        <td style="width: 10%; text-align: center;" class="section-header">UNIT</td>
        <td style="width: 10%; text-align: center;" class="section-header">QTY.</td>
        <td style="width: 10%; text-align: center;" class="section-header">RATE</td>
        <td style="width: 15%; text-align: center;" class="section-header">AMOUNT</td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td>this is standard text</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
${Array.from({length: 10}, (_, index) => {
        const item = invoice.items?.[index];
        const rate = item?.quantity ? (subTotal / invoice.items!.reduce((sum, i) => sum + i.quantity, 0)).toFixed(2) : '';
        const amount = item?.quantity ? (parseFloat(rate) * item.quantity).toFixed(2) : '';
        return `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td></td>
            <td>${item?.productName || ''}</td>
            <td style="text-align: center;">${item ? 'Nos' : ''}</td>
            <td style="text-align: center;">${item?.quantity || ''}</td>
            <td style="text-align: right;">${rate || ''}</td>
            <td style="text-align: right;">${amount || ''}</td>
          </tr>`;
      }).join('')}
      <tr>
        <td colspan="5" style="border: none;"></td>
        <td style="border: 1px solid black; text-align: right;">Sub Total</td>
        <td style="border: 1px solid black; text-align: right;">₹${subTotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="5" style="border: none;"></td>
        <td style="border: 1px solid black; text-align: right;">CGST @ 14%</td>
        <td style="border: 1px solid black; text-align: right;">₹${cgst.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="5" style="border: none;"></td>
        <td style="border: 1px solid black; text-align: right;">SGST @ 14%</td>
        <td style="border: 1px solid black; text-align: right;">₹${sgst.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="7" class="eo-text" style="border: 1px solid black; padding: 8px;">
          Amount in Words: ${amountInWords}
        </td>
      </tr>
      <tr>
        <td colspan="5" style="border: none;"></td>
        <td style="border: 1px solid black; text-align: right; font-weight: bold;">Total</td>
        <td style="border: 1px solid black; text-align: right; font-weight: bold;">₹${grandTotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="5" class="eo-text" style="border-right: none; vertical-align: bottom;">
          E. & O. E.
        </td>
        <td colspan="2" class="footer-signature" style="border-left: none;">
          For THE GLOBE STORES CO.<br><br><br>
          Partner
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`

    printWindow.document.write(html)
    printWindow.document.close()

    // Wait a moment for content to load, then print
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const handlePrintBill = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-GB')
    const subTotal = invoice.totalAmount
    const cgst = subTotal * 0.14 // 14% CGST
    const sgst = subTotal * 0.14 // 14% SGST
    const grandTotal = subTotal + cgst + sgst
    const invoiceNo = invoice.invoiceNo
    const amountInWords = amountToWordsIndian(grandTotal)

    const html = `
      <html>
      <head>
        <title>Invoice ${invoiceNo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice-box { max-width: 800px; margin: auto; padding: 20px; background-color:rgb(249, 226, 113); border: 1px solid #000; }
          table { width: 100%; border-collapse: collapse; }
          .header { font-size: 16px; font-weight: bold; text-align: left; margin-bottom: 5px; }
          .address { font-size: 11px; margin-bottom: 15px; }
          td { font-size: 11px; }
          .main-table td { border: 1px solid #000; padding: 4px; vertical-align: top; }
          .items-table { border-collapse: collapse; margin: 0; }
          .items-table td { border: 1px solid #000; padding: 4px; }
          .footer-table td { border: 1px solid #000; padding: 4px; }
          .no-border { border: none !important; }
          @media print {
            body { margin: 0; background-color: white; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">GLOBE ACCESSORIES PVT. LTD.</div>
          <div style="float: right; margin-top: -30px; margin-right: 20px;">
            <img src="/image.png" alt="Logo" style="width: 84px; height: 50px;" />
          </div>
          <div class="address">Gate No.: 2145/2146, Nanekarwadi, Chakan,<br>Tal.: Khed, Dist.: Pune - 410 501.</div>
          
          <table class="main-table">
            <tr>
              <td style="width: 65%">Range - CHAKAN VII Tal. Khed, Dist. Pune - 410 501.</td>
              <td style="width: 35%">INVOICE NO. ${invoiceNo}</td>
            </tr>
            <tr>
              <td>Division - Pune V, Dr. Ambedkar Road, Excise Bhavan,<br>Akurdi Pune - 411 044.</td>
              <td>Date: ${dateStr}</td>
            </tr>
            <tr>
              <td>To, ${invoice.customerName}<br>
                ${invoice.customerPhoneNumber ? `Phone No.: ${invoice.customerPhoneNumber}` : ''}</td>
              <td rowspan="1" style="font-size: 9px;">
                *CLEARANCE FOR HOME CONSUMPTION /<br>
                EXPORT NATURE FOR REMOVAL (e.g. Stock<br>
                Transfer / Captive use Related Person /<br>
                Independent Buyer etc.<br>
                <br>
                I.T. PAN No.: AAACG 4166 H
              </td>
            </tr>
            <tr>
              <td>Phone No.: ${invoice.customerPhoneNumber || ''}</td>
              <td>P.L.A. No.: 170 / 87 / 97</td>
            </tr>
            <tr>
              <td>GST No.: ${invoice.customerGstNo || ''}</td>
              <td>Name of Excisable Commodity : Parts & Accessories of Vehicles</td>
            </tr>
            <tr>
              <td>Category of Consignee<br>Wholesale dealer / Industrial Consumer / Government Department / etc.</td>
              <td>Tariff Heading No. 8714 19 00<br>Exemption Notification No.</td>
            </tr>
            <tr>
              <td>Your P. O. No. & Date</td>
              <td>Rate of Duty:<br>[Notification No.] 8 / 2003 dated 01/03/2003</td>
            </tr>
            <tr>
              <td>Delivery Challan No. & Date</td>
              <td>Mode of Transport: ${invoice.transport || ''}</td>
            </tr>
          </table>

          <table class="items-table" style="width: 100%; margin-top:0; border-top:0;">
            <tr>
              <td style="width: 5%">Sr.<br>No.</td>
              <td style="width: 40%">Description and Specification<br>of goods</td>
              <td style="width: 15%">No. & description<br>of Packages</td>
              <td style="width: 10%">Total Qty. of<br>goods (net)</td>
              <td style="width: 15%">Rate per Unit Rs.</td>
              <td style="width: 15%">Total Amount<br>Rs.</td>
            </tr>
            <tr>
              <td></td>
              <td>this is standard text</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
${Array.from({length: 9}, (_, index) => {
              const item = invoice.items?.[index];
              const rate = item?.quantity ? (subTotal / invoice.items!.reduce((sum, i) => sum + i.quantity, 0)).toFixed(2) : '';
              const amount = item?.quantity ? (parseFloat(rate) * item.quantity).toFixed(2) : '';
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item?.productName || ''}</td>
                  <td></td>
                  <td>${item?.quantity || ''}</td>
                  <td>${rate || ''}</td>
                  <td>${amount || ''}</td>
                </tr>
              `;
            }).join('')}
          </table>

          <table class="footer-table" style="width: 100%; border-collapse: collapse; margin-top:0;">
            <tr>
              <td rowspan="2" style="width: 10%; border: 1px solid black;">Debit<br>Entry</td>
              <td style="width: 10%; border: 1px solid black;">P.L.A.</td>
              <td style="width: 20%; border: 1px solid black;">S. No.</td>
              <td style="width: 20%; border: 1px solid black;">Date</td>
              <td style="width: 10%; border: 1px solid black;">Rs.</td>
              <td style="width: 15%; border: 1px solid black;"></td>
              <td style="width: 15%; border: 1px solid black;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid black;">Cenvat</td>
              <td style="border: 1px solid black;"></td>
              <td style="border: 1px solid black;"></td>
              <td style="border: 1px solid black;"></td>
              <td style="border: 1px solid black;"></td>
              <td style="border: 1px solid black;"></td>
            </tr>
            <tr>
              <td colspan="3" style="border: 1px solid black;">Date of issue of Invoice:</td>
              <td style="border: 1px solid black;">Time of issue of Invoice:</td>
              <td style="border: 1px solid black;">Hrs.</td>
              <td style="border: 1px solid black;"></td>
              <td style="border: 1px solid black;"></td>
            </tr>
            <tr>
              <td colspan="3" style="border: 1px solid black;">Date of removal:</td>
              <td style="border: 1px solid black;">Time of removal:</td>
              <td style="border: 1px solid black;">Hrs.</td>
              <td style="border: 1px solid black;"></td>
              <td style="border: 1px solid black;"></td>
            </tr>
            <tr>
              <td colspan="3" style="border: 1px solid black;">Mode of Transport: ${invoice.transport || ''}</td>
              <td colspan="2" style="border: 1px solid black;">Veh. No.:</td>
              <td style="border: 1px solid black;"></td>
              <td style="border: 1px solid black;"></td>
            </tr>
            <tr>
              <td colspan="5" style="border: 1px solid black; font-size: 11px;">Certified that the particulars given above are true and correct and the amount indicated represents the price<br>actually charged and that there is no flow additional consideration directly or indirectly from the buyer.</td>
              <td style="border: 1px solid black; text-align: right;">Sub Total</td>
              <td style="border: 1px solid black;">${subTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="5" style="border: 1px solid black;">Amount in words: ${amountInWords}</td>
              <td style="border: 1px solid black; text-align: right;">CGST @ 14%</td>
              <td style="border: 1px solid black;">${cgst.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="5" style="border: 1px solid black;"></td>
              <td style="border: 1px solid black; text-align: right;">SGST @ 14%</td>
              <td style="border: 1px solid black;">${sgst.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="5" style="border: 1px solid black;"></td>
              <td style="border: 1px solid black; text-align: right; font-weight: bold;">Grand Total</td>
              <td style="border: 1px solid black; font-weight: bold;">${grandTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="border: 1px solid black;">GST No.: 27AAACG4173B1Z0</td>
              <td style="border: 1px solid black; text-align: center; font-size: 11px;">Pre-authentication</td>
              <td colspan="3" style="border: 1px solid black; text-align: center;">For Globe Accessories Pvt. Ltd.<br><br><br>Authorised Signatories</td>
            </tr>
          </table>
        </div>
      </body>
      </html>`;

    printWindow.document.write(html)
    printWindow.document.close()

    // Wait a moment for content to load, then print
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  React.useEffect(() => {
    fetchInvoices()
  }, [])

  const columns = getColumns(handlePrintInvoice, handlePrintBill)

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
        <SiteHeader title="Billing History" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {error && (
                  <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
                
                <div className="w-full space-y-4 py-4">
                  <div className="flex items-center">
                    <Input
                      placeholder="Filter invoices..."
                      value={(table.getColumn("invoiceNo")?.getFilterValue() as string) ?? ""}
                      onChange={(event) =>
                        table.getColumn("invoiceNo")?.setFilterValue(event.target.value)
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
                              Loading invoices...
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
                              No invoices found.
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