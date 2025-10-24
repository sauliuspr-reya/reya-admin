import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import vault from "node-vault";

// Initialize Vault client
const vaultClient = vault({
  apiVersion: "v1",
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, database } = body;

    if (!username || !database) {
      return NextResponse.json(
        { message: "Username and database are required" },
        { status: 400 }
      );
    }

    // Map the selected database to the appropriate Vault path
    let vaultPath;
    switch (database) {
      case "production":
        vaultPath = "database/creds/readonly-production";
        break;
      case "staging":
        vaultPath = "database/creds/readonly-staging";
        break;
      case "development":
        vaultPath = "database/creds/readonly-development";
        break;
      default:
        return NextResponse.json(
          { message: "Invalid database selection" },
          { status: 400 }
        );
    }

    // Request credentials from Vault
    const vaultResponse = await vaultClient.read(vaultPath);
    
    if (!vaultResponse || !vaultResponse.data) {
      throw new Error("Failed to retrieve credentials from Vault");
    }

    // Calculate expiration time
    const leaseSeconds = vaultResponse.lease_duration || 3600; // Default to 1 hour if not specified
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + leaseSeconds);
    
    // Format credentials for response
    const credentials = {
      username: vaultResponse.data.username,
      password: vaultResponse.data.password,
      host: process.env.DB_HOST || "localhost", // These would come from environment variables
      port: process.env.DB_PORT || "5432",
      database: database,
      expiration: expirationDate.toISOString(),
    };

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("Error generating database credentials:", error);
    return NextResponse.json(
      { message: "Failed to generate credentials", error: String(error) },
      { status: 500 }
    );
  }
}
