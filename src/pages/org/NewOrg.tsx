import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const orgSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres").regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
});

type OrgFormData = z.infer<typeof orgSchema>;

export default function NewOrg() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const onSubmit = async (data: OrgFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("orgs")
        .insert({
          name: data.name,
          slug: data.slug,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as member
      const { error: memberError } = await supabase
        .from("org_members")
        .insert({
          org_id: org.id,
          user_id: user.id,
          status: "active",
        });

      if (memberError) throw memberError;

      // Assign admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: "admin",
        });

      if (roleError) throw roleError;

      toast.success("Organización creada exitosamente");
      await refreshProfile();
      navigate("/");
    } catch (error: any) {
      toast.error("Error al crear organización: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    form.setValue("name", value);
    // Auto-generate slug from name
    const slug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    form.setValue("slug", slug);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle>Crear Organización</CardTitle>
          <CardDescription>
            Configura tu organización para comenzar a gestionar completaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Organización</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mi Empresa S.A."
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificador (slug)</FormLabel>
                    <FormControl>
                      <Input placeholder="mi-empresa" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL amigable para tu organización
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Crear Organización
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
