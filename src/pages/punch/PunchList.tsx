import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePunchItems, useCreatePunchItem } from "@/hooks/usePunchItems";
import { useProjects } from "@/hooks/useProjects";
import { PUNCH_STATUSES, PUNCH_CATEGORIES } from "@/lib/constants";
import {
  Plus,
  Search,
  Loader2,
  AlertTriangle,
  Eye,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const punchSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  project_id: z.string().min(1, "Selecciona un proyecto"),
  category: z.enum(["A", "B", "C"]),
  priority: z.number().min(1).max(5).optional(),
});

type PunchFormData = {
  title: string;
  description?: string;
  project_id: string;
  category: "A" | "B" | "C";
  priority?: number;
};

export default function PunchList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: punchItems, isLoading } = usePunchItems({
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });
  const { data: projects } = useProjects();
  const createPunchItem = useCreatePunchItem();

  const form = useForm<PunchFormData>({
    resolver: zodResolver(punchSchema),
    defaultValues: {
      title: "",
      description: "",
      project_id: "",
      category: "B",
      priority: 3,
    },
  });

  const onSubmit = async (data: PunchFormData) => {
    await createPunchItem.mutateAsync(data);
    setDialogOpen(false);
    form.reset();
  };

  const filteredItems = punchItems?.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.punch_number.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const config = PUNCH_STATUSES[status as keyof typeof PUNCH_STATUSES];
    if (!config) return <Badge>{status}</Badge>;
    return (
      <Badge className={config.class}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const config = PUNCH_CATEGORIES[category as keyof typeof PUNCH_CATEGORIES];
    if (!config) return <Badge>{category}</Badge>;
    return (
      <Badge className={config.class}>
        {category} - {config.label}
      </Badge>
    );
  };

  // Stats
  const stats = {
    total: punchItems?.length || 0,
    open: punchItems?.filter((p) => p.status === "open").length || 0,
    inProgress: punchItems?.filter((p) => p.status === "in_progress").length || 0,
    cleared: punchItems?.filter((p) => p.status === "cleared").length || 0,
    closed: punchItems?.filter((p) => p.status === "closed").length || 0,
    categoryA: punchItems?.filter((p) => p.category === "A").length || 0,
    categoryB: punchItems?.filter((p) => p.category === "B").length || 0,
    categoryC: punchItems?.filter((p) => p.category === "C").length || 0,
  };

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader
          title="Punch List"
          description="Gestiona los items de pendientes y defectos"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Punch List" },
          ]}
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Punch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Punch Item</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo defecto o pendiente
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Descripción breve del defecto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="project_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proyecto</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar proyecto..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projects?.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.code} - {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">A - Seguridad (Crítico)</SelectItem>
                              <SelectItem value="B">B - Defecto</SelectItem>
                              <SelectItem value="C">C - Menor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descripción detallada del defecto..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createPunchItem.isPending}>
                        {createPunchItem.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Crear Punch
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Abiertos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cleared}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cerrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Category breakdown */}
        <div className="flex gap-2 mb-6">
          <Badge className="punch-category-a">Cat A: {stats.categoryA}</Badge>
          <Badge className="punch-category-b">Cat B: {stats.categoryB}</Badge>
          <Badge className="punch-category-c">Cat C: {stats.categoryC}</Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar punch items..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abierto</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="cleared">Resuelto</SelectItem>
              <SelectItem value="closed">Cerrado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="A">Categoría A</SelectItem>
              <SelectItem value="B">Categoría B</SelectItem>
              <SelectItem value="C">Categoría C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Punch Items Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItems?.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay punch items</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer punch item para comenzar
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Punch
            </Button>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.punch_number}</TableCell>
                    <TableCell>{getCategoryBadge(item.category)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.project?.code}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {format(new Date(item.created_at), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/punch/${item.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
