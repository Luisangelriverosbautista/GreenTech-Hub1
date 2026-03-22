import { useLanguage } from '../hooks/useLanguage';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('Sobre Nosotros', 'About Us')}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">GreenTech Hub</h2>
        <p className="text-gray-700 mb-4">
          {t(
            'GreenTech Hub es una plataforma que conecta proyectos ecológicos de creadores validados con donantes de impacto. Facilitamos la financiación de iniciativas sostenibles utilizando tecnología blockchain para asegurar que cada aporte sea una acción verificable.',
            'GreenTech Hub is a platform that connects ecological projects from validated creators with impact donors. We make sustainable initiatives easier to fund using blockchain technology so every contribution becomes a verifiable action.'
          )}
        </p>
        
        <h3 className="text-xl font-semibold mb-3">{t('Nuestra Misión', 'Our Mission')}</h3>
        <p className="text-gray-700 mb-4">
         {t(
           'Acelerar la regeneración del planeta conectando a ONGs y eco-emprendedores con donantes conscientes. Buscamos que los recursos lleguen directamente al territorio, fortaleciendo la economía local y asegurando un impacto ambiental real.',
           'Accelerate the regeneration of the planet by connecting NGOs and eco-entrepreneurs with conscious donors. We aim for resources to reach the field directly, strengthen local economies, and ensure measurable environmental impact.'
         )}
         </p>

        <h3 className="text-xl font-semibold mb-3">{t('Tecnología', 'Technology')}</h3>
        <p className="text-gray-700 mb-4">
          {t(
            'Utilizamos la red Stellar y contratos inteligentes bajo un modelo Escrow. Las donaciones no se entregan de golpe, sino que se liberan únicamente al validar hitos operativos, garantizando el rastro exacto de los fondos.',
            'We use the Stellar network and smart contracts under an escrow model. Donations are not delivered all at once; they are released only when operational milestones are validated, ensuring an exact trace of the funds.'
          )}
           </p>

        <h3 className="text-xl font-semibold mb-3">{t('Compromiso', 'Commitment')}</h3>
        <p className="text-gray-700">
         {t(
           'Nos comprometemos con la transparencia absoluta. Protegemos el dinero de nuestros usuarios y eliminamos el greenwashing, asegurando que cada proyecto financiado cumpla estrictamente con sus promesas ecológicas.',
           'We are committed to full transparency. We protect our users’ money and eliminate greenwashing, ensuring that every funded project strictly fulfills its ecological promises.'
         )}
        </p>
      </div>
    </div>
  );
};

export default About;