export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">YardSale</h1>
      <p className="max-w-prose text-base text-foreground/70 sm:text-lg">
        Buy and sell second-hand goods from people nearby.
      </p>
      <p className="font-mono text-sm text-foreground/50">
        Edit <code className="rounded bg-foreground/10 px-1.5 py-0.5">src/app/page.tsx</code> to get started.
      </p>
    </main>
  );
}
