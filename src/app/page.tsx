import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-10 px-4 py-12">
      <header className="flex max-w-xl flex-col gap-3 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Sistema de Gestión Médica
        </h1>
        <p className="text-muted-foreground sm:text-lg">
          Bienvenido. Esta es la base del sistema donde los médicos podrán
          administrar a sus pacientes.
        </p>
      </header>

      {/* Temporary design-system check; replaced by the login screen in US-04. */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Comprobación de componentes</CardTitle>
          <CardDescription>
            Vista previa del sistema de diseño.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="demo-email">Correo electrónico</Label>
          <Input
            id="demo-email"
            type="email"
            placeholder="medico@ejemplo.com"
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button type="button">Principal</Button>
          <Button type="button" variant="secondary">
            Secundario
          </Button>
          <Button type="button" variant="outline">
            Contorno
          </Button>
          <Button type="button" variant="destructive">
            Eliminar
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
