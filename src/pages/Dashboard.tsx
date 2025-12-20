import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck, UserX, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { getDashboardAnalytics, DashboardAnalytics } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getDashboardAnalytics();
        setAnalytics(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.total_clients || 0}</div>
              <p className="text-xs text-muted-foreground">All registered clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <UserCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.active_clients || 0}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Clients</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.overview.inactive_clients || 0}</div>
              <p className="text-xs text-muted-foreground">Not currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics?.overview.total_revenue || 0}</div>
              <p className="text-xs text-muted-foreground">From all clients</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Expiring Soon Clients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Expiring Soon
              </CardTitle>
              <CardDescription>
                {analytics?.overview.expiring_soon_count || 0} clients expiring within 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.expiring_soon_clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients expiring soon</p>
              ) : (
                <div className="space-y-2">
                  {analytics?.expiring_soon_clients.map((client) => (
                    <div key={client._id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{client.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{client.business_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(client.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Expired Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Expired</CardTitle>
              <CardDescription>Clients that recently expired</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.recently_expired_clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recently expired clients</p>
              ) : (
                <div className="space-y-2">
                  {analytics?.recently_expired_clients.map((client) => (
                    <div key={client._id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{client.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{client.business_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(client.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Revenue</CardTitle>
            <CardDescription>Highest revenue generating clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.top_clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No client data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    analytics?.top_clients.map((client) => (
                      <TableRow key={client._id}>
                        <TableCell className="font-medium">{client.customer_name}</TableCell>
                        <TableCell>{client.business_name}</TableCell>
                        <TableCell>
                          <Badge variant={client.status === "active" ? "default" : "secondary"}>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${client.total_revenue || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Business Type Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Business Type Distribution</CardTitle>
            <CardDescription>Revenue and client count by business type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.business_type_stats.map((stat) => (
                <div key={stat._id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium capitalize">{stat._id}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.count} clients ({stat.active_count} active)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${stat.total_revenue}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              ))}
              {(!analytics?.business_type_stats || analytics.business_type_stats.length === 0) && (
                <p className="text-sm text-muted-foreground">No business type data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
