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

interface EditPreProductionItemDialogProps {
  item: PreProductionItem
  onEditItem: () => void
  children: React.ReactNode
}

type ItemType = "Ball Bearing" | "Pin" | "Conrod" | ""

export function EditPreProductionItemDialog({ item, onEditItem, children }: EditPreProductionItemDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [availableNames, setAvailableNames] = React.useState<string[]>([])
  const [isLoadingNames, setIsLoadingNames] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    type: item.type as ItemType,
    name: item.name,
    size: item.size || "",
    variant: item.variant || "",
    quantity: item.quantity.toString(),
  })

  const sizeOptions = ["Standard", "1", "2", "3", "4", "5", "6", "7"]
  const variantOptions = ["Standard", "NRB"]

  React.useEffect(() => {
    if (open) {
      setFormData({
        type: item.type as ItemType,
        name: item.name,
        size: item.size || "",
        variant: item.variant || "",
        quantity: item.quantity.toString(),
      })
      setError(null)
      
      // Load available names for the current type
      if (item.type) {
        loadAvailableNames(item.type as ItemType)
      }
    }
  }, [open, item])

  const loadAvailableNames = async (type: ItemType) => {
    if (type && type !== "") {
      setIsLoadingNames(true)
      try {
        const apiType = type === "Ball Bearing" ? "ballBearing" : 
                       type === "Pin" ? "pin" : "conrod"
        
        const response = await fetch(`/api/conrods/unique?type=${apiType}`)
        const result = await response.json()
        
        if (result.success) {
          setAvailableNames(result.data)
        } else {
          console.error("Failed to fetch names:", result.error)
          setAvailableNames([])
        }
      } catch (error) {
        console.error("Error fetching names:", error)
        setAvailableNames([])
      } finally {
        setIsLoadingNames(false)
      }
    } else {
      setAvailableNames([])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const handleTypeChange = async (type: ItemType) => {
    setFormData(prev => ({ ...prev, type, name: "", size: "", variant: "" }))
    loadAvailableNames(type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/pre-production/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: formData.type,
          name: formData.name,
          size: formData.size || null,
          variant: formData.variant || null,
          quantity: parseInt(formData.quantity),
          dateUpdated: new Date().toISOString().split('T')[0],
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to update pre-production item")
      }

      setOpen(false)
      onEditItem()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.type && 
                     formData.name && 
                     formData.quantity &&
                     (formData.type === "Conrod" || formData.size) &&
                     (formData.type !== "Ball Bearing" || formData.variant)

  const showSizeField = formData.type === "Pin" || formData.type === "Ball Bearing"
  const showVariantField = formData.type === "Ball Bearing"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Pre-Production Item</DialogTitle>
          <DialogDescription>
            Update the details of this pre-production item.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select item type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ball Bearing">Ball Bearing</SelectItem>
                <SelectItem value="Pin">Pin</SelectItem>
                <SelectItem value="Conrod">Conrod</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type && (
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Select 
                value={formData.name} 
                onValueChange={(value) => handleInputChange("name", value)}
                disabled={isLoadingNames}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={isLoadingNames ? "Loading..." : `Select ${formData.type.toLowerCase()}`} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showSizeField && (
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
          )}

          {showVariantField && (
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
          )}

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
              {isLoading ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}