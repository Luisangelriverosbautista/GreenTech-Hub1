import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useLanguage } from '../hooks/useLanguage';

const DEFAULT_PROJECT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23d1fae5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23065f46' font-family='Arial' font-size='22'%3EProyecto%3C/text%3E%3C/svg%3E";
import { useState, useEffect } from 'react';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjects();
  const { t } = useLanguage();
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);

  useEffect(() => {
    // Mostrar los primeros 6 proyectos como destacados
    setFeaturedProjects(projects.slice(0, 6));
  }, [projects]);

  const getCategoryBadge = (category: string) => {
    const categories: { [key: string]: { label: string; emoji: string } } = {
      'renewable-energy': { label: t('Energía Renovable', 'Renewable Energy'), emoji: '⚡' },
      'recycling': { label: t('Reciclaje', 'Recycling'), emoji: '♻️' },
      'conservation': { label: t('Conservación', 'Conservation'), emoji: '🌿' },
      'sustainable-agriculture': { label: t('Agricultura Sostenible', 'Sustainable Agriculture'), emoji: '🌾' },
      'clean-water': { label: t('Agua Limpia', 'Clean Water'), emoji: '💧' }
    };
    return categories[category] || { label: category, emoji: '🌍' };
  };

  return (
    <div className="w-full h-full bg-gray-50 overflow-auto">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen pt-20 pb-32 flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-100/20 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 mb-8">
              <span className="text-green-600 text-sm font-medium">{t('🌱 Bienvenido a la Revolución Verde', '🌱 Welcome to the Green Revolution')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="text-green-600">GreenTech</span>{" "}
              <span className="text-yellow-600">Hub</span>
              <div className="text-gray-900 mt-4">{t('Comunidad Digital de', 'Digital Community for')}</div>
              <div className="text-gray-900">{t('Innovación Sostenible', 'Sustainable Innovation')}</div>
            </h1>

            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-12">
              {t(
                'Conecta con personas, organizaciones y empresas comprometidas con la sostenibilidad. Crea contenido educativo, participa en eventos y recibe reconocimiento de impacto digital por tus aportes ambientales.',
                'Connect with people, organizations, and companies committed to sustainability. Create educational content, participate in events, and receive digital impact recognition for your environmental contributions.'
              )}
            </p>

            {/* Botones acordes al proyecto */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <span className="mr-2">📊</span>
                    {t('Dashboard', 'Dashboard')}
                  </button>
                  <button 
                    onClick={() => navigate('/projects')}
                    className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
                  >
                    <span className="mr-2">🌍</span>
                    {t('Ver Proyectos', 'View Projects')}
                  </button>
                  <button 
                    onClick={() => navigate('/wallet')}
                    className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
                  >
                    <span className="mr-2">💰</span>
                    {t('Mi Wallet', 'My Wallet')}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <span className="mr-2">🚀</span>
                    {t('Comenzar Ahora', 'Get Started')}
                  </button>
                  <button 
                    onClick={() => navigate('/projects')}
                    className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
                  >
                    <span className="mr-2">🌍</span>
                    {t('Explorar Proyectos', 'Explore Projects')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="w-full py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                {t('🌟 Proyectos Destacados', '🌟 Featured Projects')}
              </h2>
              <p className="text-gray-600 text-center max-w-2xl mx-auto">
                {t(
                  'Conoce los proyectos más inspiradores de nuestra comunidad que están haciendo un impacto ambiental real',
                  'Discover the most inspiring projects in our community that are creating real environmental impact'
                )}
              </p>
            </div>

            {/* Projects Grid */}
            {featuredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProjects.map((project) => {
                  const progress = parseFloat(project.currentAmount || '0') / parseFloat(project.targetAmount || '1') * 100;
                  const categoryBadge = getCategoryBadge(project.category);

                  return (
                    <div 
                      key={project._id || project.id}
                      onClick={() => navigate(`/project/${project._id || project.id}`)}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                    >
                      {/* Image */}
                      <div className="h-48 bg-gray-100 overflow-hidden">
                        <img 
                          src={project.imageUrl || DEFAULT_PROJECT_IMAGE}
                          alt={project.title}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            if (e.currentTarget.src !== DEFAULT_PROJECT_IMAGE) {
                              e.currentTarget.src = DEFAULT_PROJECT_IMAGE;
                            }
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {categoryBadge.emoji} {categoryBadge.label}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {project.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-gray-700">
                              {parseFloat(project.currentAmount || 0).toFixed(2)} / {project.targetAmount} XLM
                            </span>
                            <span className="text-xs font-bold text-green-600">
                              {Math.min(progress, 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Creator */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {(project.creator?.username || 'A').charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs text-gray-600">
                            {t('Por', 'By')} <span className="font-semibold text-gray-900">{project.creator?.username || t('Anónimo', 'Anonymous')}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">{t('No hay proyectos disponibles aún', 'No projects are available yet')}</p>
                <button 
                  onClick={() => navigate('/projects')}
                  className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {t('Ver todos los proyectos', 'View all projects')}
                </button>
              </div>
            )}

            {/* View All Button */}
            {featuredProjects.length > 0 && (
              <div className="text-center mt-12">
                <button 
                  onClick={() => navigate('/projects')}
                  className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t('Ver Todos los Proyectos →', 'View All Projects →')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              {t('¿Por qué unirse a GreenTech Hub?', 'Why join GreenTech Hub?')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Impacto Global</h3>
                <p className="text-gray-600">
                  {t('Participa en proyectos que generan cambios reales en el medio ambiente', 'Take part in projects that create real change for the environment')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Reconocimiento Digital', 'Digital Recognition')}</h3>
                <p className="text-gray-600">
                  {t('Recibe un reconocimiento de impacto digital cuando los proyectos que apoyaste concluyan satisfactoriamente', 'Receive digital impact recognition when the projects you supported are completed successfully')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Comunidad Fuerte', 'Strong Community')}</h3>
                <p className="text-gray-600">
                  {t('Conecta con millones de personas comprometidas con la sostenibilidad', 'Connect with millions of people committed to sustainability')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;