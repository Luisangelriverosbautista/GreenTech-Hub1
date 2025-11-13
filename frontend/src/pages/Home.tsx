function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen pt-24 pb-32 flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-100/20 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 mb-8">
              <span className="text-green-600 text-sm font-medium">🌱 Bienvenido a la Revolución Verde</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="text-green-600">GreenTech</span>{" "}
              <span className="text-yellow-600">Hub</span>
              <div className="text-gray-900 mt-4">Comunidad Digital de</div>
              <div className="text-gray-900">Innovación Sostenible</div>
            </h1>

            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-12">
              Conecta con personas, organizaciones y empresas comprometidas con la sostenibilidad. 
              Crea contenido educativo, participa en eventos y gana tokens por tus acciones ambientales.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                <span className="mr-2">💳</span>
                Conectar Wallet
              </button>
              <button className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors">
                <span className="mr-2">▶️</span>
                Ver Demo
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
        </div>
      </section>
    </div>
  );
}

export default Home;