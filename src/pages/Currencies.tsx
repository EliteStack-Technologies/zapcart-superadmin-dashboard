import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Search, Pencil } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { getCurrencies, addCurrency, updateCurrency, Currency } from "@/lib/api";

const currencySchema = z.object({
  name: z.string().min(1, "Currency name is required").max(100),
  symbol: z.string().min(1, "Symbol is required").max(10),
  code: z.string().min(1, "Code is required").max(10),
});

export default function Currencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingCurrencyId, setEditingCurrencyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    code: "",
  });

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const response = await getCurrencies();
      setCurrencies(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch currencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = currencySchema.safeParse(formData);

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      if (editMode && editingCurrencyId) {
        await updateCurrency(editingCurrencyId, formData);
        toast.success("Currency updated successfully");
      } else {
        await addCurrency(formData);
        toast.success("Currency added successfully");
      }
      
      setDialogOpen(false);
      setEditMode(false);
      setEditingCurrencyId(null);
      setFormData({
        name: "",
        symbol: "",
        code: "",
      });
      fetchCurrencies();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (editMode ? "Failed to update currency" : "Failed to add currency"));
    }
  };

  const handleEdit = (currency: Currency) => {
    setEditMode(true);
    setEditingCurrencyId(currency._id);
    setFormData({
      name: currency.name,
      symbol: currency.symbol,
      code: currency.code,
    });
    setDialogOpen(true);
  };

  const filteredCurrencies = currencies.filter((currency) =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Currencies</h2>
            <p className="text-muted-foreground">Manage your currency database</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditMode(false);
              setEditingCurrencyId(null);
              setFormData({
                name: "",
                symbol: "",
                code: "",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Currency
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editMode ? "Edit Currency" : "Add New Currency"}</DialogTitle>
                <DialogDescription>
                  {editMode ? "Update the currency information below" : "Fill in the currency information below"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Currency Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., UAE Dirham"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol *</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData({ ...formData, symbol: e.target.value })
                    }
                    placeholder="e.g., AED"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., AED"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editMode ? "Update Currency" : "Add Currency"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search currencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm"
          />
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredCurrencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No currencies found. Add your first currency to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCurrencies.map((currency) => (
                  <TableRow key={currency._id}>
                    <TableCell className="font-medium">{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>{currency.code}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(currency)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
