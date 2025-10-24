"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function DBRequestsPage() {
  const [username, setUsername] = useState("");
  const [database, setDatabase] = useState("production");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
    host: string;
    port: string;
    database: string;
    expiration: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCredentials(null);

    try {
      const response = await fetch("/api/db-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          database,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to request credentials");
      }

      const data = await response.json();
      setCredentials(data);
      toast({
        title: "Success!",
        description: "Database credentials have been generated.",
      });
    } catch (error) {
      console.error("Error requesting credentials:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Credentials Request</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request New Credentials</CardTitle>
            <CardDescription>
              Generate temporary database credentials for development or analysis purposes.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="database">Database</Label>
                <Select
                  value={database}
                  onValueChange={(value) => setDatabase(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select database" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  "Request Credentials"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {credentials && (
          <Card>
            <CardHeader>
              <CardTitle>Your Credentials</CardTitle>
              <CardDescription>
                These credentials will expire on {credentials.expiration}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Host</Label>
                <Input value={credentials.host} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Port</Label>
                <Input value={credentials.port} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Database</Label>
                <Input value={credentials.database} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={credentials.username} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input value={credentials.password} readOnly />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  const connectionString = `postgresql://${credentials.username}:${credentials.password}@${credentials.host}:${credentials.port}/${credentials.database}`;
                  navigator.clipboard.writeText(connectionString);
                  toast({
                    title: "Copied!",
                    description: "Connection string copied to clipboard",
                  });
                }}
              >
                Copy Connection String
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
