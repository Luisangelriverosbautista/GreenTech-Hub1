const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sobre Nosotros</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">GreenTech Hub</h2>
        <p className="text-gray-700 mb-4">
          GreenTech Hub es una plataforma que conecta proyectos ecológicos de creadores validados con donantes de impacto. Facilitamos la financiación de iniciativas sostenibles utilizando tecnología blockchain para asegurar que cada aporte sea una acción verificable.
        </p>
        
        <h3 className="text-xl font-semibold mb-3">Nuestra Misión</h3>
        <p className="text-gray-700 mb-4">
         Acelerar la regeneración del planeta conectando a ONGs y eco-emprendedores con donantes conscientes. Buscamos que los recursos lleguen directamente al territorio, fortaleciendo la economía local y asegurando un impacto ambiental real.
         </p>

        <h3 className="text-xl font-semibold mb-3">Tecnología</h3>
        <p className="text-gray-700 mb-4">
          Utilizamos la red Stellar y contratos inteligentes bajo un modelo Escrow. Las donaciones no se entregan de golpe, sino que se liberan únicamente al validar hitos operativos, garantizando el rastro exacto de los fondos.
           </p>

        <h3 className="text-xl font-semibold mb-3">Compromiso</h3>
        <p className="text-gray-700">
         Nos comprometemos con la transparencia absoluta. Protegemos el dinero de nuestros usuarios y eliminamos el greenwashing, asegurando que cada proyecto financiado cumpla estrictamente con sus promesas ecológicas.
        </p>
      </div>
    </div>
  );
};

export default About;