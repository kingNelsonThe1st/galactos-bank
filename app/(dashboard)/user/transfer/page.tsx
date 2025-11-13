"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

const banks = [
  { value: "chase-bank", label: "Chase Bank" },
  { value: "bank-of-america", label: "Bank of America" },
  { value: "wells-fargo", label: "Wells Fargo" },
  { value: "citibank", label: "Citibank" },
  { value: "us-bank", label: "U.S. Bank" },
  { value: "pnc-bank", label: "PNC Bank" },
  { value: "capital-one", label: "Capital One" },
  { value: "truist-bank", label: "Truist Bank" },
  { value: "td-bank", label: "TD Bank" },
  { value: "ally-bank", label: "Ally Bank" },
  { value: "barclays", label: "Barclays" },
  { value: "hsbc-uk", label: "HSBC UK" },
  { value: "lloyds-bank", label: "Lloyds Bank" },
  { value: "natwest", label: "NatWest" },
  { value: "santander-uk", label: "Santander UK" },
  { value: "tsb-bank", label: "TSB Bank" },
  { value: "monzo-bank", label: "Monzo Bank" },
  { value: "starling-bank", label: "Starling Bank" },
  { value: "metro-bank", label: "Metro Bank" },
  { value: "revolut", label: "Revolut" },
]

export default function TransferPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading] = useState(false)
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    recipientName: "",
    receiverAccountNumber: "",
    bank: "",
    amount: "",
    description: ""
  })

  // Fetch user balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/user/balance')
        const data = await response.json()
        
        if (response.ok) {
          setCurrentBalance(data.balance)
        } else {
          setError("Failed to load balance")
        }
      } catch {
        setError("Error loading balance")
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchBalance()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.recipientName || !formData.receiverAccountNumber || !formData.bank || !formData.amount) {
      setError("Please fill in all required fields.")
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.")
      return
    }

    if (currentBalance !== null && amount > currentBalance) {
      setError("Insufficient balance for this transfer.")
      return
    }

    if (formData.receiverAccountNumber.length !== 8) {
      setError("Account number must be 8 digits.")
      return
    }
    
    // Store transfer data in sessionStorage and redirect to pin
    sessionStorage.setItem("transferData", JSON.stringify(formData))
    router.push("/user/transfer/pin")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // For account number, only allow digits
    if (name === "receiverAccountNumber") {
      const digitsOnly = value.replace(/\D/g, '')
      setFormData({
        ...formData,
        [name]: digitsOnly
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer Money</h1>
        <p className="text-muted-foreground">
          Send money to another account securely
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Balance</CardTitle>
          <CardDescription className="text-2xl font-bold text-foreground">
            {balanceLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : currentBalance !== null ? (
              `$${currentBalance.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`
            ) : (
              <span className="text-destructive">Error loading balance</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
          <CardDescription>
            Enter the recipient&apos;s information and transfer amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                name="recipientName"
                placeholder="Enter recipient's full name"
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank">Select Bank</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {formData.bank
                      ? banks.find((b) => b.value === formData.bank)?.label
                      : "Select bank..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search bank..." />
                    <CommandList>
                      <CommandEmpty>No bank found.</CommandEmpty>
                      <CommandGroup>
                        {banks.map((bank) => (
                          <CommandItem
                            key={bank.value}
                            value={bank.value}
                            onSelect={(currentValue) => {
                              setFormData((prev) => ({
                                ...prev,
                                bank: currentValue === prev.bank ? "" : currentValue,
                              }))
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.bank === bank.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {bank.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverAccountNumber">Account Number</Label>
              <Input
                id="receiverAccountNumber"
                name="receiverAccountNumber"
                placeholder="Enter recipient's account number"
                value={formData.receiverAccountNumber}
                onChange={handleChange}
                maxLength={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"                    
                  placeholder="0.00"
                  className="pl-7"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What's this transfer for?"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transfer Fee</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2">
                <span className="font-semibold">Total Amount</span>
                <span className="text-lg font-bold">
                  ${formData.amount ? parseFloat(formData.amount).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || balanceLoading || currentBalance === null}
            >
              {loading ? "Processing..." : "Transfer Funds"}
            </Button>
            
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <CardContent className="pt-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Security Notice:</strong> Always verify recipient details before transferring. 
            Transfers cannot be reversed once completed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}