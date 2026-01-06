import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { getClients, addClient, updateClient, deleteClient, changeClientStatus, setupDefaultCurrencies, Client as ApiClient } from "@/lib/api";

const clientSchema = z.object({
  client_id: z.string().optional(),
  client_name: z.string().min(1, "Client name is required").max(150),
  phone_number: z.string().min(1, "Phone number is required").max(20),
  email: z.string().email("Invalid email").min(1, "Email is required").max(100),
  business_name: z.string().min(1, "Business name is required").max(150),
  business_type: z.string().min(1, "Business type is required").max(100),
  sub_domain_name: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.string(),
  enquiry_mode: z.boolean().optional(),
  notes: z.string().optional(),
  amount_per_month: z.string().optional(),
  paid_months: z.string().optional(),
  whatsapp_token: z.string().optional(),
});

export default function Clients() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [originalWhatsappToken, setOriginalWhatsappToken] = useState<string>("");
  const [formData, setFormData] = useState({
    client_id: "",
    client_name: "",
    phone_number: "",
    email: "",
    business_name: "",
    business_type: "",
    sub_domain_name: "",
    start_date: "",
    end_date: "",
    status: "active",
    enquiry_mode: false,
    notes: "",
    amount_per_month: "",
    paid_months: "",
    whatsapp_token: "",
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await getClients(page, 25);
      setClients(response.clients);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = clientSchema.safeParse(formData);

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      const clientData: any = {
        client_id: formData.client_id,
        client_name: formData.client_name,
        email: formData.email,
        phone_number: formData.phone_number,
        business_name: formData.business_name,
        business_type: formData.business_type,
        sub_domain_name: formData.sub_domain_name,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        status: formData.status,
        enquiry_mode: formData.enquiry_mode,
        notes: formData.notes,
        amount_per_month: formData.amount_per_month ? Number(formData.amount_per_month) : undefined,
        paid_months: formData.paid_months ? Number(formData.paid_months) : undefined,
      };

      // Only include whatsapp_token if:
      // - In edit mode: token has changed from original
      // - In create mode: token has a value
      if (editMode) {
        if (formData.whatsapp_token !== originalWhatsappToken) {
          clientData.whatsapp_token = formData.whatsapp_token;
        }
      } else {
        if (formData.whatsapp_token && formData.whatsapp_token.trim()) {
          clientData.whatsapp_token = formData.whatsapp_token;
        }
      }

      if (editMode && editingClientId) {
        await updateClient(editingClientId, clientData);
        toast.success("Client updated successfully");
      } else {
        await addClient(clientData);
        // await setupDefaultCurrencies();
        toast.success("Client added successfully");
      }
      
      setDialogOpen(false);
      setEditMode(false);
      setEditingClientId(null);
      setOriginalWhatsappToken("");
      setFormData({
        client_id: "",
        client_name: "",
        phone_number: "",
        email: "",
        business_name: "",
        business_type: "",
        sub_domain_name: "",
        start_date: "",
        end_date: "",
        status: "active",
        enquiry_mode: false,
        notes: "",
        amount_per_month: "",
        paid_months: "",
        whatsapp_token: "",
      });
      fetchClients();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (editMode ? "Failed to update client" : "Failed to add client"));
    }
  };

  const handleEdit = (client: ApiClient) => {
    setEditMode(true);
    setEditingClientId(client._id);
    const originalToken = client.whatsapp_token?.toString() || "";
    setOriginalWhatsappToken(originalToken);
    setFormData({
      client_id: client.client_id?.toString() || "",
      client_name: client.client_name,
      phone_number: client.phone_number,
      email: client.email,
      business_name: client.business_name,
      business_type: client.business_type,
      sub_domain_name: client.sub_domain_name || "",
      start_date: client.start_date ? new Date(client.start_date).toISOString().split('T')[0] : "",
      end_date: client.end_date ? new Date(client.end_date).toISOString().split('T')[0] : "",
      status: client.status,
      enquiry_mode: client.enquiry_mode || false,
      notes: client.notes || "",
      amount_per_month: client.amount_per_month?.toString() || "",
      paid_months: client.paid_months?.toString() || "",
      whatsapp_token: client.whatsapp_token?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (clientId: string) => {
    setDeletingClientId(clientId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClientId) return;

    try {
      await deleteClient(deletingClientId);
      toast.success("Client deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingClientId(null);
      fetchClients();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete client");
    }
  };

  const handleStatusChange = async (clientId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    try {
      await changeClientStatus(clientId, newStatus);
      toast.success(`Client status changed to ${newStatus}`);
      fetchClients();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change client status");
    }
  };

  const handleEnquiryModeChange = async (clientId: string, currentEnquiryMode: boolean) => {
    const newEnquiryMode = !currentEnquiryMode;
    
    try {
      await updateClient(clientId, { enquiry_mode: newEnquiryMode });
      toast.success(`Enquiry mode ${newEnquiryMode ? 'enabled' : 'disabled'}`);
      fetchClients();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change enquiry mode");
    }
  };


  const filteredClients = clients.filter((client) =>
    client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.client_id && String(client.client_id).toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.business_name && client.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h2>
            <p className="text-muted-foreground">Manage your client database</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditMode(false);
              setEditingClientId(null);
              setOriginalWhatsappToken("");
              setFormData({
                client_id: "",
                client_name: "",
                phone_number: "",
                email: "",
                business_name: "",
                business_type: "",
                sub_domain_name: "",
                start_date: "",
                end_date: "",
                status: "active",
                enquiry_mode: false,
                notes: "",
                amount_per_month: "",
                paid_months: "",
                whatsapp_token: "",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Client" : "Add New Client"}</DialogTitle>
                <DialogDescription>
                  {editMode ? "Update the client information below" : "Fill in the client information below"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name *</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name}
                      onChange={(e) =>
                        setFormData({ ...formData, client_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_id">Client ID</Label>
                    <Input
                      id="client_id"
                      value={formData.client_id}
                      onChange={(e) =>
                        setFormData({ ...formData, client_id: e.target.value })
                      }
                      placeholder="Auto-generated if not provided"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({ ...formData, phone_number: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name *</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) =>
                        setFormData({ ...formData, business_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_type">Business Type *</Label>
                    <Select
                      value={formData.business_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, business_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supermarket">Supermarket</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="cloths">Cloths</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub_domain_name">Sub Domain Name</Label>
                    <Input
                      id="sub_domain_name"
                      value={formData.sub_domain_name}
                      onChange={(e) =>
                        setFormData({ ...formData, sub_domain_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enquiry_mode">Enquiry Mode</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enquiry_mode"
                        checked={formData.enquiry_mode}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, enquiry_mode: checked })
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {formData.enquiry_mode ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount_per_month">Amount Per Month</Label>
                    <Input
                      id="amount_per_month"
                      type="number"
                      value={formData.amount_per_month}
                      onChange={(e) =>
                        setFormData({ ...formData, amount_per_month: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paid_months">Paid Months</Label>
                    <Input
                      id="paid_months"
                      type="number"
                      value={formData.paid_months}
                      onChange={(e) =>
                        setFormData({ ...formData, paid_months: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_token">WhatsApp Token</Label>
                    <Textarea
                      id="whatsapp_token"
                      value={formData.whatsapp_token}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp_token: e.target.value })
                      }
                      placeholder="Enter WhatsApp token"
                      rows={3}
                    />
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Add any additional notes about the client..."
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editMode ? "Update Client" : "Add Client"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm"
          />
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Amount/Month</TableHead>
                <TableHead>Paid Months</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enquiry Mode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    No clients found. Add your first client to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>{client.client_id || "-"}</TableCell>
                    <TableCell className="font-medium">{client.client_name}</TableCell>
                    <TableCell>{client.email || "-"}</TableCell>
                    <TableCell>{client.phone_number || "-"}</TableCell>
                    <TableCell>{client.business_name || "-"}</TableCell>
                    <TableCell>
                      {client.currency_id ? (
                        <span className="font-medium">
                          {client.currency_id.symbol} {client.currency_id.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.amount_per_month ? (
                        <span className="font-medium">
                          {client.currency_id?.symbol || ""} {client.amount_per_month}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.paid_months !== undefined && client.paid_months !== null ? (
                        <span>{client.paid_months}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.start_date
                        ? new Date(client.start_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {client.end_date
                        ? new Date(client.end_date).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={client.status === "active"}
                          onCheckedChange={() => handleStatusChange(client._id, client.status)}
                        />
                        <span className="text-sm">
                          {client.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={client.enquiry_mode || false}
                          onCheckedChange={() => handleEnquiryModeChange(client._id, client.enquiry_mode || false)}
                        />
                        <span className="text-sm">
                          {client.enquiry_mode ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(client._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {clients.length} of {total} clients
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">Page {page} of {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
