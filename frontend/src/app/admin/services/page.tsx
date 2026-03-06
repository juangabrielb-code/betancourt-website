import Link from 'next/link';
import { AdminServiceList } from '@/components/admin/AdminServiceList';

export default function AdminServicesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-1">
            Servicios
          </h1>
          <p className="text-j-light-text/60 dark:text-j-dark-text/60 text-sm">
            Gestiona los precios y detalles de cada servicio
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-warm-glow text-j-dark-bg font-semibold text-sm hover:bg-warm-glow/90 transition-colors"
        >
          <span>+</span>
          Nuevo servicio
        </Link>
      </div>

      <AdminServiceList />
    </div>
  );
}
