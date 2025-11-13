const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contacto</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Envíanos un mensaje</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Tu nombre"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="¿En qué podemos ayudarte?"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full button-primary"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Información de Contacto</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Email</h3>
              <p className="text-gray-600">soporte.auxiliarvirtual.edu.mx@gmail.com</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Redes Sociales</h3>
              <div className="flex space-x-4 mt-2">
                <a href="#" className="text-gray-600 hover:text-green-600">
                  Twitter
                </a>
                <a href="#" className="text-gray-600 hover:text-green-600">
                  LinkedIn
                </a>
                <a href="#" className="text-gray-600 hover:text-green-600">
                  GitHub
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Horario de Atención</h3>
              <p className="text-gray-600">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;