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
import { useTags, useCreateTag } from "@/hooks/useTags";
import { useSubsystems } from "@/hooks/useSystems";
import { useDisciplines } from "@/hooks/useDisciplines";
import {
  Plus,
  Search,
  Tag,
  Loader2,
  Filter,
} from "lucide-react";

const tagSchema = z.object({
  tag_number: z.string().min(2, "El número de tag debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  subsystem_id: z.string().min(1, "Selecciona un subsistema"),
  discipline_id: z.string().optional(),
  equipment_type: z.string().optional(),
  location: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
});

type TagFormData = z.infer<typeof tagSchema>;

export default function Tags() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: tags, isLoading } = useTags();
  const { data: subsystems } = useSubsystems();
  const { data: disciplines } = useDisciplines();
  const createTag = useCreateTag();

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      tag_number: "",
      description: "",
      subsystem_id: "",
      discipline_id: "",
      equipment_type: "",
      location: "",
      manufacturer: "",
      model: "",
      serial_number: "",
    },
  });

  const onSubmit = async (data: TagFormData) => {
    await createTag.mutateAsync({
      ...data,
      discipline_id: data.discipline_id || null,
    });
    setDialogOpen(false);
    form.reset();
  };

  const filteredTags = tags?.filter(
    (t) =>
      t.tag_number.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader
          title="Tags"
          description="Gestiona los equipos y componentes del proyecto"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Tags" },
          ]}
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Tag
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Tag</DialogTitle>
                  <DialogDescription>
                    Ingresa los datos del nuevo equipo o componente
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tag_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Tag</FormLabel>
                            <FormControl>
                              <Input placeholder="EQ-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subsystem_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subsistema</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subsystems?.map((sub) => (
                                  <SelectItem key={sub.id} value={sub.id}>
                                    {sub.code} - {sub.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discipline_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Disciplina</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {disciplines?.map((disc) => (
                                  <SelectItem key={disc.id} value={disc.id}>
                                    {disc.code} - {disc.name}
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
                        name="equipment_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Equipo</FormLabel>
                            <FormControl>
                              <Input placeholder="Motor, Válvula, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descripción del equipo..."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ubicación</FormLabel>
                            <FormControl>
                              <Input placeholder="Área, Zona, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="manufacturer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fabricante</FormLabel>
                            <FormControl>
                              <Input placeholder="Marca" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <FormControl>
                              <Input placeholder="Número de modelo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serial_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Serie</FormLabel>
                            <FormControl>
                              <Input placeholder="S/N" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createTag.isPending}>
                        {createTag.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Crear Tag
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
              placeholder="Buscar tags..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tags Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTags?.length === 0 ? (
          <Card className="p-12 text-center">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay tags</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer tag para comenzar
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Tag
            </Button>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Subsistema</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags?.map((tag) => (
                  <TableRow
                    key={tag.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/tags/${tag.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{tag.tag_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {tag.description || "-"}
                    </TableCell>
                    <TableCell>
                      {tag.discipline ? (
                        <Badge
                          style={{ backgroundColor: tag.discipline.color }}
                          className="text-white"
                        >
                          {tag.discipline.code}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {tag.subsystem?.code} - {tag.subsystem?.name}
                      </span>
                    </TableCell>
                    <TableCell>{tag.location || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tag.status === "active" ? "default" : "secondary"}
                      >
                        {tag.status === "active" ? "Activo" : tag.status}
                      </Badge>
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
