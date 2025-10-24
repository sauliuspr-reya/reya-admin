import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Account } from '@/lib/api';

interface AccountSummaryPanelProps {
  account: Account;
  walletAddress: string;
  discordName?: string | null;
  accountName?: string | null;
}

export function AccountSummaryPanel({
  account,
  walletAddress,
  discordName,
  accountName,
}: AccountSummaryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-none">
            <CardHeader className="p-0">
              <p className="text-sm text-muted-foreground">Account ID</p>
            </CardHeader>
            <CardContent className="p-0 pt-1.5">
              <p className="text-2xl font-bold">{account.id}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none">
            <CardHeader className="p-0">
              <p className="text-sm text-muted-foreground">Wallet</p>
            </CardHeader>
            <CardContent className="p-0 pt-1.5">
              <p className="text-2xl font-bold truncate" title={walletAddress}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none">
            <CardHeader className="p-0">
              <p className="text-sm text-muted-foreground">Discord</p>
            </CardHeader>
            <CardContent className="p-0 pt-1.5">
              <p className="text-2xl font-bold">{discordName || '-'}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none">
            <CardHeader className="p-0">
              <p className="text-sm text-muted-foreground">Name</p>
            </CardHeader>
            <CardContent className="p-0 pt-1.5">
              <p className="text-2xl font-bold">{accountName || '-'}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
