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

interface AddConrodDialogProps {
  onAddConrod: () => void
  children: React.ReactNode
}

export function AddConrodDialog({ onAddConrod, children }: AddConrodDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    conrodName: "",
    conrodVariant: "",
    conrodSize: "",
    smallEndDiameter: "",
    bigEndDiameter: "",
    centerDistance: "",
    pinName: "",
    pinSize: "",
    ballBearingName: "",
    ballBearingVariant: "",
    ballBearingSize: "",
  })

  const variantOptions = ["Standard", "NRB"]
  const sizeOptions = ["Standard", "1", "2", "3", "4", "5", "6", "7"]

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
      // Generate serial number (simple auto-increment based on timestamp)
      const serialNumber = `CR${Date.now().toString().slice(-6)}`
      
      const response = await fetch("/api/conrods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serialNumber,
          conrodName: formData.conrodName,
          conrodVariant: formData.conrodVariant,
          conrodSize: formData.conrodSize,
          smallEndDiameter: parseFloat(formData.smallEndDiameter),
          bigEndDiameter: parseFloat(formData.bigEndDiameter),
          centerDistance: parseFloat(formData.centerDistance),
          pinName: formData.pinName,
          pinSize: formData.pinSize,
          ballBearingName: formData.ballBearingName,
          ballBearingVariant: formData.ballBearingVariant,
          ballBearingSize: formData.ballBearingSize,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to save conrod")
      }

      // Reset form and close dialog
      setFormData({
        conrodName: "",
        conrodVariant: "",
        conrodSize: "",
        smallEndDiameter: "",
        bigEndDiameter: "",
        centerDistance: "",
        pinName: "",
        pinSize: "",
        ballBearingName: "",
        ballBearingVariant: "",
        ballBearingSize: "",
      })
      setOpen(false)
      
      // Notify parent to refresh data
      onAddConrod()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save conrod")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.conrodName && 
                     formData.conrodVariant && 
                     formData.conrodSize && 
                     formData.smallEndDiameter && 
                     formData.bigEndDiameter && 
                     formData.centerDistance && 
                     formData.pinName && 
                     formData.pinSize && 
                     formData.ballBearingName && 
                     formData.ballBearingVariant && 
                     formData.ballBearingSize

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Conrod to Database</DialogTitle>
          <DialogDescription>
            Enter the details for the new conrod entry.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Conrod Information Row */}
          <div className="space-y-2">
            <Label>Conrod Information</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="conrodName" className="text-xs">Name</Label>
                <Input
                  id="conrodName"
                  placeholder="e.g., Honda CB150R"
                  value={formData.conrodName}
                  onChange={(e) => handleInputChange("conrodName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="conrodVariant" className="text-xs">Variant</Label>
                <Select 
                  value={formData.conrodVariant} 
                  onValueChange={(value) => handleInputChange("conrodVariant", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Variant" />
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
              <div className="space-y-1">
                <Label htmlFor="conrodSize" className="text-xs">Size</Label>
                <Select 
                  value={formData.conrodSize} 
                  onValueChange={(value) => handleInputChange("conrodSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Size" />
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
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="smallEndDiameter">Small End Dia. (mm)</Label>
            <Input
              id="smallEndDiameter"
              type="number"
              step="0.1"
              placeholder="e.g., 15.5"
              value={formData.smallEndDiameter}
              onChange={(e) => handleInputChange("smallEndDiameter", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bigEndDiameter">Big End Dia. (mm)</Label>
            <Input
              id="bigEndDiameter"
              type="number"
              step="0.1"
              placeholder="e.g., 42.0"
              value={formData.bigEndDiameter}
              onChange={(e) => handleInputChange("bigEndDiameter", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="centerDistance">Center Dist. (mm)</Label>
            <Input
              id="centerDistance"
              type="number"
              step="0.1"
              placeholder="e.g., 110.5"
              value={formData.centerDistance}
              onChange={(e) => handleInputChange("centerDistance", e.target.value)}
              required
            />
          </div>
          
          {/* Pin Information Row */}
          <div className="space-y-2">
            <Label>Pin Information</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="pinName" className="text-xs">Name</Label>
                <Input
                  id="pinName"
                  placeholder="e.g., PIN-CB150-001"
                  value={formData.pinName}
                  onChange={(e) => handleInputChange("pinName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pinSize" className="text-xs">Size</Label>
                <Select 
                  value={formData.pinSize} 
                  onValueChange={(value) => handleInputChange("pinSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Size" />
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
            </div>
          </div>
          
          {/* Ball Bearing Information Row */}
          <div className="space-y-2">
            <Label>Ball Bearing Information</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="ballBearingName" className="text-xs">Name</Label>
                <Input
                  id="ballBearingName"
                  placeholder="e.g., BB-6201-2RS"
                  value={formData.ballBearingName}
                  onChange={(e) => handleInputChange("ballBearingName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ballBearingVariant" className="text-xs">Variant</Label>
                <Select 
                  value={formData.ballBearingVariant} 
                  onValueChange={(value) => handleInputChange("ballBearingVariant", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Variant" />
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
              <div className="space-y-1">
                <Label htmlFor="ballBearingSize" className="text-xs">Size</Label>
                <Select 
                  value={formData.ballBearingSize} 
                  onValueChange={(value) => handleInputChange("ballBearingSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Size" />
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
            </div>
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
              {isLoading ? "Saving..." : "Save Conrod"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}