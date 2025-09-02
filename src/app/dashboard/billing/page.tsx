"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Customer = {
  id: number
  name: string
  address: string
  email?: string
  phone?: string
}

type ConrodAssemblyItem = {
  id: number
  name: string
  type: string
  size?: string
  variant?: string
  quantity: number
  dateUpdated: string
  createdAt: string
}

type ProductItem = {
  id: string
  productId: number
  productName: string
  quantity: number
  amountPerUnit: number
}

export default function BillingPage() {
  const [invoiceNo, setInvoiceNo] = React.useState("")
  const [selectedCustomer, setSelectedCustomer] = React.useState("")
  const [products, setProducts] = React.useState<ProductItem[]>([])
  const [selectedProduct, setSelectedProduct] = React.useState("")
  const [quantity, setQuantity] = React.useState("")
  const [amountPerUnit, setAmountPerUnit] = React.useState("")
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [conrodAssemblies, setConrodAssemblies] = React.useState<ConrodAssemblyItem[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setIsLoadingCustomers(true)
      const response = await fetch("/api/customers")
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch customers")
      }
      
      setCustomers(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customers")
    } finally {
      setIsLoadingCustomers(false)
    }
  }

  // Fetch conrod assemblies from API
  const fetchConrodAssemblies = async () => {
    try {
      setIsLoadingProducts(true)
      const response = await fetch("/api/conrod-assemblies")
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch products")
      }
      
      setConrodAssemblies(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products")
    } finally {
      setIsLoadingProducts(false)
    }
  }

  React.useEffect(() => {
    fetchCustomers()
    fetchConrodAssemblies()
  }, [])

  const availableProducts = conrodAssemblies.filter(item => item.quantity > 0)

  const handleAddProduct = () => {
    if (!selectedProduct || !quantity || !amountPerUnit) {
      return
    }

    const product = availableProducts.find(p => p.id.toString() === selectedProduct)
    if (!product) return

    const requestedQuantity = parseInt(quantity)

    // Check if requested quantity exceeds available stock
    if (requestedQuantity > product.quantity) {
      alert(`Cannot add ${requestedQuantity} units. Available stock: ${product.quantity}`)
      return
    }

    // Check if this product is already added and total would exceed stock
    const existingProduct = products.find(p => p.productId === product.id)
    const totalQuantity = existingProduct ? existingProduct.quantity + requestedQuantity : requestedQuantity
    
    if (totalQuantity > product.quantity) {
      const remainingStock = product.quantity - (existingProduct?.quantity || 0)
      alert(`Cannot add ${requestedQuantity} more units. You can add up to ${remainingStock} more units (${product.quantity} total stock, ${existingProduct?.quantity || 0} already added)`)
      return
    }

    const newProduct: ProductItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      quantity: requestedQuantity,
      amountPerUnit: parseFloat(amountPerUnit)
    }

    setProducts([...products, newProduct])
    setSelectedProduct("")
    setQuantity("")
    setAmountPerUnit("")
  }

  const handleRemoveProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId))
  }

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + (product.quantity * product.amountPerUnit)
    }, 0).toFixed(2)
  }

  const handleCreateBill = async () => {
    if (!invoiceNo || !selectedCustomer || products.length === 0) {
      alert("Please fill in all required fields and add at least one product")
      return
    }

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNo,
          customerId: selectedCustomer,
          products: products.map(p => ({
            productId: p.productId,
            productName: p.productName,
            quantity: p.quantity,
            amountPerUnit: p.amountPerUnit
          }))
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create invoice")
      }

      // Show success message with inventory deductions
      let successMessage = "Invoice created successfully!"
      if (result.inventoryDeductions && result.inventoryDeductions.length > 0) {
        successMessage += "\n\nInventory deducted:"
        result.inventoryDeductions.forEach((deduction: any) => {
          successMessage += `\n• ${deduction.productName}: -${deduction.quantityDeducted} (Remaining: ${deduction.remainingQuantity})`
        })
      }
      alert(successMessage)
      
      // Reset form
      setInvoiceNo("")
      setSelectedCustomer("")
      setProducts([])
      
      // Refresh product data to update stock levels
      fetchConrodAssemblies()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice")
      alert(`Error: ${err instanceof Error ? err.message : "Failed to create invoice"}`)
    }
  }

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
        <SiteHeader title="Create Invoice" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Details</CardTitle>
                    <CardDescription>
                      Create a new invoice for customer billing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {error && (
                      <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="invoiceNo">Invoice No</Label>
                        <Input
                          id="invoiceNo"
                          placeholder="INV-001"
                          value={invoiceNo}
                          onChange={(e) => setInvoiceNo(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer">Customer</Label>
                        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Select a customer"} />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Add Products</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="product">Product</Label>
                          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select product"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} (Stock: {product.quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="1"
                            min="1"
                            max={selectedProduct ? availableProducts.find(p => p.id.toString() === selectedProduct)?.quantity : undefined}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount per Unit</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={amountPerUnit}
                            onChange={(e) => setAmountPerUnit(e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={handleAddProduct} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                          </Button>
                        </div>
                      </div>
                    </div>

                    {products.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Products Added</h3>
                        <div className="border rounded-lg">
                          <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b bg-muted/50">
                            <div>Product</div>
                            <div>Quantity</div>
                            <div>Amount/Unit</div>
                            <div>Total</div>
                            <div>Action</div>
                          </div>
                          {products.map((product) => (
                            <div key={product.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0">
                              <div>{product.productName}</div>
                              <div>{product.quantity}</div>
                              <div>${product.amountPerUnit.toFixed(2)}</div>
                              <div>${(product.quantity * product.amountPerUnit).toFixed(2)}</div>
                              <div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="p-4 bg-muted/50">
                            <div className="flex justify-between items-center font-medium">
                              <span>Total Amount:</span>
                              <span className="text-lg">${calculateTotal()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button onClick={handleCreateBill} size="lg">
                        Create Bill
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}