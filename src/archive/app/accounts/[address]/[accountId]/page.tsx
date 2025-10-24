import { getAccounts, getPositions, getTransactions, getDiscordDetails, getMarkets } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatUSD, formatNumber, formatDate } from '@/lib/utils';
import { AccountSummaryPanel } from '@/components/account-summary-panel';
import { ErrorBoundary } from "@/components/error-boundary";

// This enables caching
export const revalidate = 60; // revalidate every 60 seconds

interface PageProps {
  params: Promise<{
    address: string;
    accountId: string;
  }>;
}

export default async function AccountDetailPage({ params }: PageProps) {
  const { address, accountId } = await params;
  
  try {
    const accounts = await getAccounts(address);
    const account = accounts.find(a => a.id === Number(accountId));
    const positions = await getPositions(address, accountId);
    const discordDetails = await getDiscordDetails(address);
    const markets = await getMarkets();
    
    if (!account) {
      return (
        <div className="flex-1 space-y-4 p-8 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Account not found</p>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    // Try to fetch transactions, but don't fail the whole page if it fails
    let transactions = [];
    try {
      transactions = await getTransactions(Number(accountId));
    } catch (error) {
      console.error('[Page] Failed to fetch transactions:', error);
      // Continue without transactions
    }
    
    return (
      <ErrorBoundary>
        <div className="container mx-auto py-10">
          <AccountSummaryPanel
            account={account}
            walletAddress={address}
            discordName={discordDetails?.discordUsername}
            accountName={discordDetails?.discordGlobalName}
            />
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatUSD(account.totalBalance)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    With Haircut: {formatUSD(account.totalBalanceWithHaircut)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    24h change: {account.totalBalanceChange24HPercentage.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Health Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className={`capitalize ${
                      account.marginRatioHealth === 'healthy' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {account.marginRatioHealth}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Margin Ratio: {(account.marginRatioPercentage * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requirement: {formatUSD(account.liquidationMarginRequirement)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    PnL Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className={account.realizedPnlHistoryTotal > 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatUSD(account.realizedPnlHistoryTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Live PnL: {formatUSD(account.livePnL)} {account.livePnLUnderlyingAsset}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Realized PnL: {formatUSD(account.realizedPnL)} {account.realizedPnLUnderlyingAsset}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Position Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {account.totalPositionsCount} Positions
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Markets: {new Set(account.positions.map(p => p.market)).size}
                  </p>
                  {account.isApproachingLiquidation && (
                    <p className="text-xs text-yellow-500 font-medium mt-1">
                      ⚠️ Approaching Liquidation
                    </p>
                  )}
                  {account.isLiquidationImminent && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      🚨 Liquidation Imminent
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="positions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="positions">Open Positions</TabsTrigger>
                <TabsTrigger value="collateral">Collateral</TabsTrigger>
                <TabsTrigger value="history">Position History</TabsTrigger>
                <TabsTrigger value="transactions">Ledger</TabsTrigger>
              </TabsList>
              
              <TabsContent value="positions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Open Positions ({account.totalPositionsCount})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {account.positions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Market</TableHead>
                            <TableHead>Side</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Entry Price</TableHead>
                            <TableHead>Mark Price</TableHead>
                            <TableHead>PnL</TableHead>
                            <TableHead>Margin Ratio</TableHead>
                            <TableHead>Funding Rate</TableHead>
                            <TableHead>Liquidation Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Raw Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          { account.positions.map((position, index) => (
                            <TableRow key={`${position.marketId || 'unknown'}-${index}`}>
                              <TableCell>{position.marketId}</TableCell>
                              <TableCell>
                                <span className={position.side === 'long' ? 'text-green-500' : 'text-red-500'}>
                                  {position.side?.toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell>{formatNumber(position.base || 0)}</TableCell>
                              <TableCell>{formatUSD(position.price || 0)} rUSD</TableCell>
                              <TableCell>{formatUSD(position.markPrice || 0)} rUSD</TableCell>
                              <TableCell className={position.unrealisedPnl > 0 ? 'text-green-500' : 'text-red-500'}>
                                {formatUSD(position.unrealisedPnl || 0)} rUSD
                              </TableCell>
                              <TableCell>
                                <span className={`${
                                  (position.marginRatio || 0) > 0.1 ? 'text-green-500' : 
                                  (position.marginRatio || 0) > 0.05 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                  {((position.marginRatio || 0) * 100).toFixed(2)}%
                                </span>
                              </TableCell>
                              <TableCell>{((position.fundingRate || 0) * 100).toFixed(4)}%</TableCell>
                              <TableCell>
                                {!position.liquidationPrice || position.liquidationPrice === 0 
                                  ? '—' 
                                  : formatUSD(position.liquidationPrice)
                                }
                              </TableCell>
                              <TableCell>
                                {position.isApproachingLiquidation && (
                                  <span className="text-yellow-500">⚠️</span>
                                )}
                                {position.isLiquidationImminent && (
                                  <span className="text-red-500">🚨</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <details className="text-xs">
                                  <summary className="cursor-pointer hover:text-blue-500">View Raw</summary>
                                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-96">
                                    {JSON.stringify(position, null, 2)}
                                  </pre>
                                </details>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">No open positions</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="collateral" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Collateral Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Balance (RUSD)</TableHead>
                          <TableHead>Balance with Haircut (RUSD)</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Exchange Rate</TableHead>
                          <TableHead>24h Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {account.collaterals.map((collateral, index) => (
                          <TableRow key={index}>
                            <TableCell>{collateral.token}</TableCell>
                            <TableCell>{formatNumber(collateral.balance)}</TableCell>
                            <TableCell>{formatUSD(collateral.balanceRUSD)}</TableCell>
                            <TableCell>{formatUSD(collateral.balanceWithHaircutRUSD)}</TableCell>
                            <TableCell>{formatNumber(collateral.percentage)}%</TableCell>
                            <TableCell>{formatNumber(collateral.exchangeRate)}</TableCell>
                            <TableCell className={collateral.exchangeRateChange24HPercentage > 0 ? 'text-green-500' : 'text-red-500'}>
                              {formatNumber(collateral.exchangeRateChange24HPercentage)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Position History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {positions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Market</TableHead>
                            <TableHead>Side</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Realised PnL</TableHead>
                            <TableHead>Funding PnL</TableHead>
                            <TableHead>Price Variation PnL</TableHead>
                            <TableHead>Fees</TableHead>
                            <TableHead>Raw Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {positions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>{formatDate(tx.timestamp)}</TableCell>
                              <TableCell>{tx.id}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                  tx.action === 'OPEN' ? 'bg-green-50 text-green-700' :
                                  tx.action === 'CLOSE' ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-gray-50 text-gray-700'
                                }`}>
                                  {tx.action}
                                </span>
                              </TableCell>
                              <TableCell>{tx.market}</TableCell>
                              <TableCell>
                                <span className={tx.side === 'long' ? 'text-green-500' : 'text-red-500'}>
                                  {tx.side?.toUpperCase() || '-'}
                                </span>
                              </TableCell>
                              <TableCell>{tx.size ? formatNumber(tx.size) : '-'}</TableCell>
                              <TableCell>{tx.price ? formatUSD(tx.price) : '-'}</TableCell>
                              <TableCell>{tx.value ? formatUSD(tx.value) : '-'}</TableCell>
                              <TableCell className={tx.realisedPnl > 0 ? 'text-green-500' : 'text-red-500'}>
                                {tx.realisedPnl ? formatUSD(tx.realisedPnl) : '-'}
                              </TableCell>
                              <TableCell className={tx.fundingPnl > 0 ? 'text-green-500' : 'text-red-500'}>
                                {tx.fundingPnl ? formatUSD(tx.fundingPnl) : '-'}
                              </TableCell>
                              <TableCell className={tx.priceVariationPnl > 0 ? 'text-green-500' : 'text-red-500'}>
                                {tx.priceVariationPnl ? formatUSD(tx.priceVariationPnl) : '-'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {tx.fees ? formatUSD(tx.fees) : '-'}
                              </TableCell>
                              <TableCell>
                                <details className="text-xs">
                                  <summary className="cursor-pointer hover:text-blue-500">View Raw</summary>
                                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-96">
                                    {JSON.stringify(tx, null, 2)}
                                  </pre>
                                </details>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No transaction history available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Ledger</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!transactions?.length ? (
                      <div className="flex items-center justify-center py-6">
                        <p className="text-muted-foreground">No ledger entries found</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Token</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Value (USD)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Link</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                  tx.type === 'deposit' ? 'bg-green-50 text-green-700' :
                                  tx.type === 'withdrawal' ? 'bg-yellow-50 text-yellow-700' :
                                  tx.type === 'swap_in' ? 'bg-blue-50 text-blue-700' :
                                  tx.type === 'swap_out' ? 'bg-purple-50 text-purple-700' :
                                  'bg-gray-50 text-gray-700'
                                }`}>
                                  {tx.type.toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell>{tx.token}</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(tx.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatUSD(tx.amount)}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                  tx.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                                  tx.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                  tx.status === 'failed' ? 'bg-red-50 text-red-700' :
                                  'bg-gray-50 text-gray-700'
                                }`}>
                                  {tx.status.toUpperCase()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <a
                                  href={tx.transactionLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  View
                                </a>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ErrorBoundary>
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
