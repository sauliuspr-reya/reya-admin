import { getAccounts, getWalletByAccountId, getDiscordDetails } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { formatUSD, isEthereumAddress, isValidAccountId } from '@/lib/utils';
import { notFound } from 'next/navigation';

// This enables caching
export const revalidate = 60; // revalidate every 60 seconds

export default async function AccountPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  if (!address) {
    return notFound();
  }

  try {
    let walletAddress = address;
    
    // If the address is not an Ethereum address, check if it's a valid account ID
    if (!isEthereumAddress(address) && isValidAccountId(address)) {
      const wallet = await getWalletByAccountId(parseInt(address));
      if (!wallet) {
        return notFound();
      }
      walletAddress = wallet;
    }

    const [accounts, discordDetails] = await Promise.all([
      getAccounts(walletAddress),
      getDiscordDetails(walletAddress)
    ]);

    // Calculate summary statistics
    const summary = {
      totalBalanceUSD: accounts.reduce((sum, acc) => sum + acc.totalBalance, 0),
      averageChange24H: accounts.length > 0 
        ? accounts.reduce((sum, acc) => sum + acc.totalBalanceChange24HPercentage, 0) / accounts.length 
        : 0,
      totalRealizedPnL: accounts.reduce((sum, acc) => sum + acc.realizedPnlHistoryTotal, 0),
      totalLivePnL: accounts.reduce((sum, acc) => sum + acc.livePnL, 0),
      totalPositions: accounts.reduce((sum, acc) => sum + acc.totalPositionsCount, 0),
      totalPositionSize: accounts.reduce((sum, acc) => 
        sum + acc.positions.reduce((posSum, pos) => posSum + Math.abs(pos.base || 0), 0), 0),
      activeMarkets: new Set(accounts.flatMap(acc => acc.positions.map(p => p.market))).size,
      healthyAccounts: accounts.filter(acc => acc.marginRatioHealth === 'healthy').length,
      totalAccounts: accounts.length
    };

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Account Overview</h2>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatUSD(summary.totalBalanceUSD)}</div>
              <p className={`text-xs ${summary.averageChange24H >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                24h avg: {summary.averageChange24H.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.totalRealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatUSD(summary.totalRealizedPnL)}
              </div>
              <p className={`text-xs ${summary.totalLivePnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                Live: {formatUSD(summary.totalLivePnL)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Position Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatUSD(summary.totalPositionSize)}</div>
              <p className="text-xs text-muted-foreground">
                Total Open Size
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalPositions}</div>
              <p className="text-xs text-muted-foreground">
                Active Markets: {summary.activeMarkets}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.healthyAccounts}/{summary.totalAccounts}</div>
              <p className="text-xs text-muted-foreground">accounts healthy</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Address Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Address:</span>
                <span className="text-sm text-muted-foreground">{walletAddress}</span>
              </div>
              {discordDetails && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Discord:</span>
                    <span className="text-sm text-muted-foreground">
                      {discordDetails.discordGlobalName || discordDetails.discordUsername}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rank:</span>
                    <span className="text-sm text-muted-foreground">
                      {discordDetails.rank || 'None'}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Accounts List */}
          <Card>
            <CardHeader>
              <CardTitle>Margin Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <Link 
                    key={account.id}
                    href={`/accounts/${walletAddress}/${account.id}`}
                    className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Account {account.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.totalPositionsCount} positions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatUSD(account.totalBalance)}</p>
                        <p className={`text-sm ${account.marginRatioHealth === 'healthy' ? 'text-green-500' : 'text-red-500'}`}>
                          {account.marginRatioHealth}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('[Page] Error:', error);
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Failed to load account information</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
