const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sobre Nosotros</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">GreenTech Hub</h2>
        <p className="text-gray-700 mb-4">
          GreenTech Hub es una plataforma innovadora que conecta proyectos ecológicos con inversores comprometidos 
          con el medio ambiente. Nuestra misión es facilitar la financiación de iniciativas sostenibles 
          utilizando tecnología blockchain para garantizar transparencia y eficiencia.
        </p>
        
        <h3 className="text-xl font-semibold mb-3">Nuestra Misión</h3>
        <p className="text-gray-700 mb-4">
          Buscamos acelerar la transición hacia un futuro más sostenible facilitando la conexión entre 
          emprendedores verdes e inversores conscientes del medio ambiente.
        </p>

        <h3 className="text-xl font-semibold mb-3">Tecnología</h3>
        <p className="text-gray-700 mb-4">
          Utilizamos la blockchain de Stellar y Soroban para garantizar transacciones seguras y transparentes, 
          permitiendo un seguimiento claro de las inversiones y su impacto ambiental.
        </p>

        <h3 className="text-xl font-semibold mb-3">Compromiso</h3>
        <p className="text-gray-700">
          Nos comprometemos a mantener los más altos estándares de transparencia y sostenibilidad, 
          trabajando continuamente para mejorar nuestra plataforma y maximizar el impacto positivo 
          en el medio ambiente.
        </p>
      </div>
    </div>
  );
};

export default About;