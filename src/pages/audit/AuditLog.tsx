import { useState } from "react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuditLog } from "@/hooks/useAuditLog";
import {
  Search,
  Loader2,
  History,
  Eye,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const actionLabels: Record<string, { label: string; class: string }> = {
  INSERT: { label: "Crear", class: "bg-success text-success-foreground" },
  UPDATE: { label: "Actualizar", class: "bg-info text-info-foreground" },
  DELETE: { label: "Eliminar", class: "bg-destructive text-destructive-foreground" },
};

const tableLabels: Record<string, string> = {
  projects: "Proyectos",
  systems: "Sistemas",
  subsystems: "Subsistemas",
  tags: "Tags",
  itrs: "ITRs",
  itr_templates: "Plantillas ITR",
  punch_items: "Punch Items",
  signoffs: "Firmas",
  disciplines: "Disciplinas",
  org_members: "Miembros",
  user_roles: "Roles",
};

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logs, isLoading } = useAuditLog({
    tableName: tableFilter !== "all" ? tableFilter : undefined,
    action: actionFilter !== "all" ? actionFilter : undefined,
    limit: 200,
  });

  const filteredLogs = logs?.filter(
    (log) =>
      log.table_name.toLowerCase().includes(search.toLowerCase()) ||
      log.record_id?.toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    const config = actionLabels[action];
    if (!config) return <Badge>{action}</Badge>;
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader
          title="Registro de Auditoría"
          description="Historial de cambios en el sistema"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Auditoría" },
          ]}
        />

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tabla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las tablas</SelectItem>
              {Object.entries(tableLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="INSERT">Crear</SelectItem>
              <SelectItem value="UPDATE">Actualizar</SelectItem>
              <SelectItem value="DELETE">Eliminar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredLogs?.length === 0 ? (
          <Card className="p-12 text-center">
            <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay registros</h3>
            <p className="text-muted-foreground">
              Los cambios en el sistema aparecerán aquí
            </p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Tabla</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), "dd MMM yyyy HH:mm", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tableLabels[log.table_name] || log.table_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.record_id?.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {log.user_id ? (
                        <span className="text-sm">{log.user_id.slice(0, 8)}...</span>
                      ) : (
                        <span className="text-muted-foreground">Sistema</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLog(log)}
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

        {/* Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Cambio</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                    <p>
                      {format(new Date(selectedLog.created_at), "PPpp", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Acción</p>
                    <p>{getActionBadge(selectedLog.action)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tabla</p>
                    <p>{tableLabels[selectedLog.table_name] || selectedLog.table_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID Registro</p>
                    <p className="font-mono text-sm">{selectedLog.record_id}</p>
                  </div>
                </div>

                {selectedLog.old_data && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Datos Anteriores
                    </p>
                    <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.old_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_data && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Datos Nuevos
                    </p>
                    <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.new_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
