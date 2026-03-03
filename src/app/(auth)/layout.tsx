export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
            P
          </div>
          <h1 className="text-2xl font-bold">PropLens</h1>
          <p className="text-sm text-muted-foreground">
            Property analytics dashboard
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
