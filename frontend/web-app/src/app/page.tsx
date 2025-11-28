export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">
          EHRMS - Electronic Health Records Management System
        </h1>
        <p className="text-xl mb-4">
          Dane County Department of Human Services
        </p>
        <div className="mt-8">
          <p className="mb-2">System Status: Operational</p>
          <p className="mb-2">Version: 1.0.0</p>
        </div>
      </div>
    </main>
  );
}

