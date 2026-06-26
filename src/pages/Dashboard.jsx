function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="mt-3 text-slate-600">
          This is the protected dashboard shell for your application.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
          <p className="mt-2 text-sm text-slate-600">
            Manage invoice drafts and completed documents here.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Clients</h3>
          <p className="mt-2 text-sm text-slate-600">
            Keep your client records organized in one place.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
