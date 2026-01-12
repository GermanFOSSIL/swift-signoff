import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, FolderKanban, ClipboardCheck, AlertTriangle, BarChart3 } from "lucide-react";

export default function Index() {
  const { user, isLoading, currentOrg, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // If user has no org, show org creation flow
  if (!currentOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle>¡Bienvenido a CompletionHub!</CardTitle>
            <CardDescription>
              Para comenzar, crea tu organización o espera una invitación de un administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => navigate("/org/new")}>
              Crear Organización
            </Button>
            <Button variant="outline" className="w-full" onClick={signOut}>
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">CompletionHub</h1>
              <p className="text-xs text-muted-foreground">{currentOrg.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Resumen de tu sistema de completaciones</p>
        </div>

        {/* Quick stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total activos</p>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">ITRs</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Pendientes de revisión</p>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Punch Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Abiertos</p>
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completación</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Progreso general</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Navega a los módulos principales del sistema</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <FolderKanban className="h-6 w-6" />
              <span>Proyectos</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <ClipboardCheck className="h-6 w-6" />
              <span>ITRs</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Punch List</span>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
