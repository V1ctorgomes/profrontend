import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="border-dashed border-white/20 bg-card/40">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="rounded-full bg-white/10 p-4">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Módulo em desenvolvimento</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Este módulo será implementado nas próximas etapas do projeto,
              seguindo o PRD definido.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
