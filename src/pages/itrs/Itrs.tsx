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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useItrs, useCreateItr, useItrTemplates } from "@/hooks/useItrs";
import { useTags } from "@/hooks/useTags";
import { ITR_STATUSES } from "@/lib/constants";
import {
  Plus,
  Search,
  Loader2,
  ClipboardCheck,
  Play,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const itrSchema = z.object({
  template_id: z.string().min(1, "Selecciona una plantilla"),
  tag_id: z.string().min(1, "Selecciona un tag"),
  itr_number: z.string().min(1, "Ingresa un número de ITR"),
});

type ItrFormData = {
  template_id: string;
  tag_id: string;
  itr_number: string;
};

export default function Itrs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: itrs, isLoading } = useItrs(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const { data: templates } = useItrTemplates();
  const { data: tags } = useTags();
  const createItr = useCreateItr();

  const form = useForm<ItrFormData>({
    resolver: zodResolver(itrSchema),
    defaultValues: {
      template_id: "",
      tag_id: "",
      itr_number: "",
    },
  });

  const onSubmit = async (data: ItrFormData) => {
    await createItr.mutateAsync(data);
    setDialogOpen(false);
    form.reset();
  };

  const filteredItrs = itrs?.filter(
    (itr) =>
      itr.itr_number.toLowerCase().includes(search.toLowerCase()) ||
      itr.template?.name?.toLowerCase().includes(search.toLowerCase()) ||
      itr.tag?.tag_number?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const config = ITR_STATUSES[status as keyof typeof ITR_STATUSES];
    if (!config) return <Badge>{status}</Badge>;
    return (
      <Badge className={config.class}>
        {config.label}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader
          title="ITRs"
          description="Lista de registros de inspección y pruebas"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "ITRs" },
          ]}
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo ITR
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear ITR</DialogTitle>
                  <DialogDescription>
                    Asigna una plantilla ITR a un tag
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="itr_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de ITR</FormLabel>
                          <FormControl>
                            <Input placeholder="ITR-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="template_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plantilla</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar plantilla..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templates?.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.code} - {template.name}
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
                      name="tag_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tag</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tag..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tags?.map((tag) => (
                                <SelectItem key={tag.id} value={tag.id}>
                                  {tag.tag_number} - {tag.description || "Sin descripción"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                      <Button type="submit" disabled={createItr.isPending}>
                        {createItr.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Crear ITR
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ITRs..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="in_review">En Revisión</SelectItem>
              <SelectItem value="approved">Aprobado</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ITRs Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItrs?.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay ITRs</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer ITR para comenzar
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo ITR
            </Button>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Plantilla</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItrs?.map((itr) => (
                  <TableRow key={itr.id}>
                    <TableCell className="font-medium">{itr.itr_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{itr.template?.code}</Badge>
                      <span className="ml-2 text-sm">{itr.template?.name}</span>
                    </TableCell>
                    <TableCell>{itr.tag?.tag_number}</TableCell>
                    <TableCell>{getStatusBadge(itr.status)}</TableCell>
                    <TableCell>
                      {format(new Date(itr.created_at), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {itr.status === "draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/itrs/${itr.id}/execute`)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Ejecutar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/itrs/${itr.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
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
