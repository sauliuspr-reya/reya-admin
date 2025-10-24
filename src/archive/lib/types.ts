export interface WalletDiscord {
  id: number;
  wallet_address: string;
  discord_id: string;
  discord_username: string;
  created_at: Date;
  updated_at: Date;
}

export interface AccountOverview {
  id: number;
  address: string;
  positions: number;
  collateral: string;
  pnl: string;
  health: string;
  lastActive: string;
  discordInfo?: {
    username: string;
    id: string;
  };
}
