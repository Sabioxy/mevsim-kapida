import { Container } from "@/components/ui/Container";

export default function GlobalLoading() {
  return (
    <Container className="flex h-[70vh] flex-col items-center justify-center">
      <div className="relative flex h-20 w-20">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs uppercase tracking-tighter">
          Taze
        </span>
      </div>
      <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-emerald-800 animate-pulse">
        Hasat Ediliyor...
      </p>
    </Container>
  );
}
