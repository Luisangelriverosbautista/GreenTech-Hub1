import { useState, type FC } from "react";
import { Dialog } from "@headlessui/react";
import { Link } from "react-router-dom";

const Navbar: FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<"donor" | "creator">("donor");

  return (
    <>
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-green-600">GreenTech Hub</span>
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/projects"
                  className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-green-600"
                >
                  Proyectos
                </Link>
                <Link
                  to="/create-project"
                  className="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-green-600"
                >
                  Crear Proyecto
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="ml-4 px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Dialog 
        open={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-full items-center justify-center p-4 backdrop-blur-sm bg-black/40">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-2xl font-bold text-center text-gray-900 mb-6">
              Bienvenido a GreenTech Hub
            </Dialog.Title>

            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setAuthType("donor")}
                className={
                  authType === "donor"
                    ? "flex-1 py-3 px-4 rounded-xl bg-green-600 text-white shadow-lg transition-all"
                    : "flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                }
              >
                Donante
              </button>
              <button
                onClick={() => setAuthType("creator")}
                className={
                  authType === "creator"
                    ? "flex-1 py-3 px-4 rounded-xl bg-green-600 text-white shadow-lg transition-all"
                    : "flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                }
              >
                Creador
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all"
              >
                {authType === "donor" ? "Ingresar como Donante" : "Ingresar como Creador"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsAuthOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default Navbar;