import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-white p-6">
        <div className="text-lg font-semibold text-emerald-900">Sayfa bulunamadı</div>
        <div className="mt-2 text-sm text-emerald-600">
          Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
        </div>
        <div className="mt-6">
          <Link href="/">
            <Button>Ana Sayfa</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
