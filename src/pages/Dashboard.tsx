import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/contexts/AuthContext";
import { ITR_STATUSES, PUNCH_CATEGORIES } from "@/lib/constants";
import {
  FolderKanban,
  Layers,
  Tag,
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentOrg } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const itrChartData = [
    { name: "Borrador", value: stats?.itrsDraft || 0, color: "hsl(var(--muted-foreground))" },
    { name: "En Revisión", value: stats?.itrsInReview || 0, color: "hsl(var(--info))" },
    { name: "Aprobado", value: stats?.itrsApproved || 0, color: "hsl(var(--success))" },
    { name: "Rechazado", value: stats?.itrsRejected || 0, color: "hsl(var(--destructive))" },
  ];

  const punchChartData = [
    { name: "Cat A", value: stats?.punchByCategory?.find(p => p.category === "A")?.count || 0, color: "hsl(var(--destructive))" },
    { name: "Cat B", value: stats?.punchByCategory?.find(p => p.category === "B")?.count || 0, color: "hsl(var(--warning))" },
    { name: "Cat C", value: stats?.punchByCategory?.find(p => p.category === "C")?.count || 0, color: "hsl(var(--info))" },
  ];

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader
          title="Dashboard"
          description={`Resumen de completaciones - ${currentOrg?.name || ""}`}
        />

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="card-interactive" onClick={() => navigate("/projects")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.projectsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Total activos</p>
            </CardContent>
          </Card>

          <Card className="card-interactive" onClick={() => navigate("/systems")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sistemas</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.systemsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Total registrados</p>
            </CardContent>
          </Card>

          <Card className="card-interactive" onClick={() => navigate("/tags")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tags</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.tagsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Equipos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completación</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
              <Progress value={stats?.completionRate || 0} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* ITR & Punch Stats */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* ITR Stats */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" />
                    ITRs
                  </CardTitle>
                  <CardDescription>Estado de inspecciones</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/itrs")}>
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                  <span className="text-sm">Borrador: {stats?.itrsDraft || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-info" />
                  <span className="text-sm">En Revisión: {stats?.itrsInReview || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm">Aprobado: {stats?.itrsApproved || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm">Rechazado: {stats?.itrsRejected || 0}</span>
                </div>
              </div>
              {stats?.itrsTotal > 0 && (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={itrChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {itrChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Punch Stats */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Punch List
                  </CardTitle>
                  <CardDescription>Defectos y pendientes</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/punch")}>
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm">Abiertos: {stats?.punchOpen || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-info" />
                  <span className="text-sm">En Progreso: {stats?.punchInProgress || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Resueltos: {stats?.punchCleared || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Cerrados: {stats?.punchClosed || 0}</span>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <Badge className="punch-category-a">Cat A: {stats?.punchByCategory?.find(p => p.category === "A")?.count || 0}</Badge>
                <Badge className="punch-category-b">Cat B: {stats?.punchByCategory?.find(p => p.category === "B")?.count || 0}</Badge>
                <Badge className="punch-category-c">Cat C: {stats?.punchByCategory?.find(p => p.category === "C")?.count || 0}</Badge>
              </div>
              {stats?.punchTotal > 0 && (
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={punchChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {punchChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Navega a los módulos principales del sistema</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/projects")}
            >
              <FolderKanban className="h-6 w-6" />
              <span>Proyectos</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/itrs")}
            >
              <ClipboardCheck className="h-6 w-6" />
              <span>ITRs</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/punch")}
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Punch List</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/review")}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Cola de Revisión</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
