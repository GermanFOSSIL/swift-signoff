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
import { useDisciplines, useCreateDiscipline, useDeleteDiscipline } from "@/hooks/useDisciplines";
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Wrench,
} from "lucide-react";

const disciplineSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  code: z.string().min(2, "El código debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  color: z.string().default("#6366f1"),
});

type DisciplineFormData = {
  name: string;
  code: string;
  description?: string;
  color: string;
};

const colorOptions = [
  { value: "#6366f1", label: "Índigo" },
  { value: "#22c55e", label: "Verde" },
  { value: "#f59e0b", label: "Ámbar" },
  { value: "#ef4444", label: "Rojo" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#8b5cf6", label: "Violeta" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#14b8a6", label: "Verde Azulado" },
];

export default function Disciplines() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: disciplines, isLoading } = useDisciplines();
  const createDiscipline = useCreateDiscipline();
  const deleteDiscipline = useDeleteDiscipline();

  const form = useForm<DisciplineFormData>({
    resolver: zodResolver(disciplineSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      color: "#6366f1",
    },
  });

  const onSubmit = async (data: DisciplineFormData) => {
    await createDiscipline.mutateAsync(data);
    setDialogOpen(false);
    form.reset();
  };

  const filteredDisciplines = disciplines?.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader
          title="Disciplinas"
          description="Gestiona las disciplinas de inspección"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Configuración" },
            { label: "Disciplinas" },
          ]}
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Disciplina
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Disciplina</DialogTitle>
                  <DialogDescription>
                    Ingresa los datos de la nueva disciplina
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Eléctrica" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input placeholder="ELEC" {...field} />
                          </FormControl>
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
                            <Input placeholder="Descripción..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 flex-wrap">
                              {colorOptions.map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  className={`w-8 h-8 rounded-full border-2 ${
                                    field.value === color.value
                                      ? "border-foreground"
                                      : "border-transparent"
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  onClick={() => field.onChange(color.value)}
                                  title={color.label}
                                />
                              ))}
                            </div>
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
                      <Button type="submit" disabled={createDiscipline.isPending}>
                        {createDiscipline.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Crear Disciplina
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar disciplinas..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Disciplines Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredDisciplines?.length === 0 ? (
          <Card className="p-12 text-center">
            <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay disciplinas</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera disciplina para comenzar
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Disciplina
            </Button>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisciplines?.map((discipline) => (
                  <TableRow key={discipline.id}>
                    <TableCell>
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: discipline.color || "#6366f1" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{ backgroundColor: discipline.color || "#6366f1" }}
                        className="text-white"
                      >
                        {discipline.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{discipline.name}</TableCell>
                    <TableCell>{discipline.description || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("¿Estás seguro de eliminar esta disciplina?")) {
                            deleteDiscipline.mutate(discipline.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
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
