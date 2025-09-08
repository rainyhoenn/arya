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

interface CreateConrodAssemblyDialogProps {
  onCreateAssembly: () => void
  children: React.ReactNode
}

export function CreateConrodAssemblyDialog({ onCreateAssembly, children }: CreateConrodAssemblyDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [availableConrods, setAvailableConrods] = React.useState<string[]>([])
  const [isLoadingConrods, setIsLoadingConrods] = React.useState(false)
  const [recipe, setRecipe] = React.useState<any>(null)
  const [isLoadingRecipe, setIsLoadingRecipe] = React.useState(false)
  const [inventory, setInventory] = React.useState<any>(null)
  const [isLoadingInventory, setIsLoadingInventory] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    conrod: "",
    variant: "",
    size: "",
    quantity: "",
  })

  const variantOptions = ["Local", "NRB"]
  const sizeOptions = ["STD", "1", "2", "3", "4", "5", "6", "7"]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
    // Clear recipe and inventory when conrod selection changes
    if (field === "conrod" || field === "variant" || field === "size") {
      setRecipe(null)
      setInventory(null)
    }
  }

  const fetchRecipe = async () => {
    if (!formData.conrod || !formData.variant || !formData.size) {
      setRecipe(null)
      return
    }

    setIsLoadingRecipe(true)
    try {
      const params = new URLSearchParams({
        conrodName: formData.conrod,
        conrodVariant: formData.variant,
        conrodSize: formData.size,
      })
      
      const response = await fetch(`/api/conrods/recipe?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setRecipe(result.data)
        // Fetch inventory for required components
        fetchInventoryAvailability(result.data)
      } else {
        setRecipe(null)
        setInventory(null)
        if (response.status === 404) {
          setError("No recipe found for this conrod configuration. Please add it to the database first.")
        }
      }
    } catch (error) {
      console.error("Error fetching recipe:", error)
      setRecipe(null)
    } finally {
      setIsLoadingRecipe(false)
    }
  }

  const fetchInventoryAvailability = async (recipeData: any) => {
    setIsLoadingInventory(true)
    try {
      const response = await fetch("/api/pre-production")
      const result = await response.json()
      
      if (result.success) {
        const preProductionItems = result.data
        
        // Find available pin inventory
        const availablePin = preProductionItems.find((item: any) => 
          item.type === "pin" && 
          item.name === recipeData.requiredComponents.pin.name && 
          item.size === recipeData.requiredComponents.pin.size
        )
        
        // Find available ball bearing inventory
        const availableBallBearing = preProductionItems.find((item: any) => 
          item.type === "ballBearing" && 
          item.name === recipeData.requiredComponents.ballBearing.name && 
          item.variant === recipeData.requiredComponents.ballBearing.variant &&
          item.size === recipeData.requiredComponents.ballBearing.size
        )
        
        setInventory({
          pin: availablePin || { quantity: 0 },
          ballBearing: availableBallBearing || { quantity: 0 }
        })
      } else {
        setInventory(null)
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
      setInventory(null)
    } finally {
      setIsLoadingInventory(false)
    }
  }

  React.useEffect(() => {
    fetchRecipe()
  }, [formData.conrod, formData.variant, formData.size])

  const fetchConrods = async () => {
    setIsLoadingConrods(true)
    try {
      const response = await fetch("/api/conrods/unique?type=conrod")
      const result = await response.json()
      
      if (result.success) {
        setAvailableConrods(result.data)
      } else {
        console.error("Failed to fetch conrods:", result.error)
        setAvailableConrods([])
      }
    } catch (error) {
      console.error("Error fetching conrods:", error)
      setAvailableConrods([])
    } finally {
      setIsLoadingConrods(false)
    }
  }

  React.useEffect(() => {
    if (open) {
      fetchConrods()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // TODO: Replace with actual API endpoint for conrod assemblies
      const response = await fetch("/api/conrod-assemblies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conrodType: formData.conrod,
          variant: formData.variant,
          size: formData.size,
          quantity: parseInt(formData.quantity),
          dateUpdated: new Date().toISOString().split('T')[0],
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to create conrod assembly")
      }

      // Reset form and close dialog
      setFormData({
        conrod: "",
        variant: "",
        size: "",
        quantity: "",
      })
      setRecipe(null)
      setInventory(null)
      setOpen(false)
      
      // Notify parent to refresh data
      onCreateAssembly()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create conrod assembly")
    } finally {
      setIsLoading(false)
    }
  }

  const requestedQuantity = parseInt(formData.quantity) || 0
  const hasInsufficientInventory = inventory && (
    inventory.pin.quantity < requestedQuantity ||
    inventory.ballBearing.quantity < requestedQuantity
  )
  
  const isFormValid = formData.conrod && 
                     formData.variant && 
                     formData.size && 
                     formData.quantity && 
                     recipe !== null &&
                     inventory !== null &&
                     !hasInsufficientInventory

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Conrod Assembly</DialogTitle>
          <DialogDescription>
            Create a new conrod assembly entry.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conrod">Conrod *</Label>
            <Select 
              value={formData.conrod} 
              onValueChange={(value) => handleInputChange("conrod", value)}
              disabled={isLoadingConrods}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={isLoadingConrods ? "Loading..." : "Select conrod"} 
                />
              </SelectTrigger>
              <SelectContent>
                {availableConrods.map((conrod) => (
                  <SelectItem key={conrod} value={conrod}>
                    {conrod}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Recipe Information */}
          {isLoadingRecipe && (
            <div className="rounded-md border border-muted bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground">Loading recipe...</div>
            </div>
          )}

          {recipe && (
            <div className="space-y-4">
              <div className="border-b border-black pb-2">
                <h2 className="text-sm font-bold tracking-wide text-black uppercase">
                  Required Components
                </h2>
              </div>
              
              {isLoadingInventory ? (
                <div className="border border-black bg-white p-4 text-center">
                  <div className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                    Loading Inventory...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* Pin Component */}
                  <div className="border border-black bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
                    <div className="pl-3 pr-2 py-3">
                      <div className="mb-3">
                        <div className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-1">
                          01 / PIN
                        </div>
                        <h3 className="text-xs font-black text-black leading-tight tracking-wide mb-1">
                          {recipe.requiredComponents.pin.name}
                        </h3>
                        <div className="text-xs text-gray-600">
                          Size {recipe.requiredComponents.pin.size}
                        </div>
                      </div>
                      
                      {inventory && (
                        <div className="space-y-2 pt-2 border-t border-gray-300">
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-bold tracking-[0.15em] text-gray-500">
                              AVAIL
                            </div>
                            <div className={`text-sm font-black ${inventory.pin.quantity >= requestedQuantity ? 'text-black' : 'text-gray-400'}`}>
                              {inventory.pin.quantity}
                            </div>
                          </div>
                          {requestedQuantity > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="text-xs font-bold tracking-[0.15em] text-gray-500">
                                REQ
                              </div>
                              <div className="text-sm font-black text-black">
                                {requestedQuantity}
                              </div>
                            </div>
                          )}
                          
                          {inventory.pin.quantity < requestedQuantity && requestedQuantity > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                              <div className="bg-black text-white px-2 py-1 text-xs font-bold tracking-[0.15em] uppercase">
                                Short: {requestedQuantity - inventory.pin.quantity}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ball Bearing Component */}
                  <div className="border border-black bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
                    <div className="pl-3 pr-2 py-3">
                      <div className="mb-3">
                        <div className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-1">
                          02 / BEARING
                        </div>
                        <h3 className="text-xs font-black text-black leading-tight tracking-wide mb-1">
                          {recipe.requiredComponents.ballBearing.name}
                        </h3>
                        <div className="text-xs text-gray-600">
                          {recipe.requiredComponents.ballBearing.variant} • Size {recipe.requiredComponents.ballBearing.size}
                        </div>
                      </div>
                      
                      {inventory && (
                        <div className="space-y-2 pt-2 border-t border-gray-300">
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-bold tracking-[0.15em] text-gray-500">
                              AVAIL
                            </div>
                            <div className={`text-sm font-black ${inventory.ballBearing.quantity >= requestedQuantity ? 'text-black' : 'text-gray-400'}`}>
                              {inventory.ballBearing.quantity}
                            </div>
                          </div>
                          {requestedQuantity > 0 && (
                            <div className="flex justify-between items-center">
                              <div className="text-xs font-bold tracking-[0.15em] text-gray-500">
                                REQ
                              </div>
                              <div className="text-sm font-black text-black">
                                {requestedQuantity}
                              </div>
                            </div>
                          )}
                          
                          {inventory.ballBearing.quantity < requestedQuantity && requestedQuantity > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                              <div className="bg-black text-white px-2 py-1 text-xs font-bold tracking-[0.15em] uppercase">
                                Short: {requestedQuantity - inventory.ballBearing.quantity}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {hasInsufficientInventory && (
                <div className="border border-black bg-white p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-sm font-black">
                      !
                    </div>
                    <div>
                      <div className="font-black text-black text-xs tracking-wide uppercase mb-1">
                        Insufficient Inventory
                      </div>
                      <div className="text-xs text-gray-600">
                        Reduce quantity or replenish components
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-300">
                <div className="text-xs text-gray-500 font-medium tracking-[0.1em] uppercase">
                  Dimensions: {recipe.dimensions.smallEndDiameter} × {recipe.dimensions.bigEndDiameter} × {recipe.dimensions.centerDistance} mm
                </div>
              </div>
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
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}