import { useLanguage } from '../hooks/useLanguage';

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('Contacto', 'Contact')}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('Envíanos un mensaje', 'Send us a message')}</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('Nombre', 'Name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder={t('Tu nombre', 'Your name')}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('Email', 'Email')}
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
                {t('Mensaje', 'Message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder={t('¿En qué podemos ayudarte?', 'How can we help you?')}
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full button-primary"
            >
              {t('Enviar Mensaje', 'Send Message')}
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('Información de Contacto', 'Contact Information')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Email</h3>
              <p className="text-gray-600">soporte.auxiliarvirtual.edu.mx@gmail.com</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">{t('Redes Sociales', 'Social Media')}</h3>
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
              <h3 className="text-lg font-medium text-gray-900">{t('Horario de Atención', 'Support Hours')}</h3>
              <p className="text-gray-600">{t('Lunes a Viernes: 9:00 AM - 6:00 PM', 'Monday to Friday: 9:00 AM - 6:00 PM')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;