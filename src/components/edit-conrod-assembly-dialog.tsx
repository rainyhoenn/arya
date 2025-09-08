"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface ConrodAssemblyItem {
  id: number
  name: string
  type: string
  size?: string
  variant?: string
  quantity: number
  dateUpdated: string
  createdAt: string
}

interface EditConrodAssemblyDialogProps {
  item: ConrodAssemblyItem
  onEditItem: () => void
  children: React.ReactNode
}

export function EditConrodAssemblyDialog({ item, onEditItem, children }: EditConrodAssemblyDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const [formData, setFormData] = React.useState({
    name: item.name,
    size: item.size || "",
    variant: item.variant || "",
    quantity: item.quantity.toString(),
  })

  const variantOptions = ["Local", "NRB"]
  const sizeOptions = ["STD", "1", "2", "3", "4", "5", "6", "7"]

  // Reset form data when item changes or dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: item.name,
        size: item.size || "",
        variant: item.variant || "",
        quantity: item.quantity.toString(),
      })
      setError(null)
    }
  }, [open, item])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/conrod-assemblies/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          size: formData.size,
          variant: formData.variant,
          quantity: parseInt(formData.quantity),
          dateUpdated: new Date().toISOString().split('T')[0],
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update conrod assembly")
      }

      setOpen(false)
      
      // Notify parent to refresh data
      onEditItem()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update conrod assembly")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.name && 
                     formData.variant && 
                     formData.size && 
                     formData.quantity &&
                     parseInt(formData.quantity) > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Conrod Assembly</DialogTitle>
          <DialogDescription>
            Update the conrod assembly information.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Conrod Name *</Label>
            <Input
              id="name"
              placeholder="Enter conrod name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="variant">Variant *</Label>
            <Select 
              value={formData.variant} 
              onValueChange={(value) => handleInputChange("variant", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                {variantOptions.map((variant) => (
                  <SelectItem key={variant} value={variant}>
                    {variant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size *</Label>
            <Select 
              value={formData.size} 
              onValueChange={(value) => handleInputChange("size", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              required
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}