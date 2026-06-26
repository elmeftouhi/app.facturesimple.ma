import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700">
            <FontAwesomeIcon icon={faLayerGroup} className="h-6 w-6 text-slate-500" />
            <div>
              <h1 className="text-2xl font-semibold">Facture Simple</h1>
              <p className="mt-2 text-slate-600">
                Auth scaffold with login and registration forms.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Login />
          <Register />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
