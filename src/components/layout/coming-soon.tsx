import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-900">{title}</h1>
        <p className="text-slate-500">{description}</p>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white">
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <div className="rounded-full bg-slate-100 p-4">
            <Construction className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-brand-900">Módulo em desenvolvimento</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Este módulo será implementado nas próximas etapas do projeto,
              seguindo o PRD definido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
