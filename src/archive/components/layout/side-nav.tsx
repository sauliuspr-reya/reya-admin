import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WalletIcon, ArrowLeftRight, Download, Upload, PlusCircle } from "lucide-react"

interface Account {
  name: string
  balance: number
  currency: string
  change: number
}

interface SideNavProps extends React.HTMLAttributes<HTMLDivElement> {
  accounts?: Account[]
}

export function SideNav({ className, accounts }: SideNavProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              Accounts
            </h2>
            <ScrollArea className="h-[300px] px-1">
              {accounts?.map((account, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <WalletIcon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span>{account.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {account.balance} {account.currency}
                    </span>
                  </div>
                </Button>
              ))}
            </ScrollArea>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transfer
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              Deposit
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Upload className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
