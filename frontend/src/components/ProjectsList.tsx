import type { FC } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  impact: string;
  funds: number;
  category: string;
  image: string;
  progress: number;
  creator: {
    name: string;
    image: string;
  };
  daysLeft: number;
}

const ProjectCard: FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img src={project.image} alt={project.title} className="w-full h-64 object-cover" />
        <div className="absolute top-4 right-4">
          <span className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
            {project.category}
          </span>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center">
          <img src={project.creator.image} alt={project.creator.name} className="w-10 h-10 rounded-full border-2 border-white" />
          <div className="ml-2 text-white">
            <p className="text-sm font-medium">{project.creator.name}</p>
            <p className="text-xs opacity-80">Creador del proyecto</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex-1">{project.title}</h3>
          <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {project.daysLeft} días restantes
          </span>
        </div>
        <p className="text-gray-600 mb-6 line-clamp-2">{project.description}</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Progreso del Proyecto</span>
              <span className="font-bold text-green-600">{project.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-500">Recaudado</p>
              <p className="text-lg font-bold text-gray-900">{(project.funds * project.progress / 100).toFixed(2)} XLM</p>
            </div>
            <div>
              <p className="text-gray-500">Meta</p>
              <p className="text-lg font-bold text-gray-900">{project.funds} XLM</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="text-xl">🌍</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Impacto Ambiental</p>
              <p className="text-sm text-gray-500 line-clamp-2">{project.impact}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl">
            Donar Ahora
          </button>
          <button className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            ♡
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectsList: FC = () => {
  const projects: Project[] = [
    {
      id: '1',
      title: 'Instalación de Paneles Solares',
      description: 'Instalación de paneles solares en comunidades rurales para promover la energía limpia y reducir costos energéticos. Este proyecto busca empoderar a las comunidades con energía renovable y sostenible.',
      impact: 'Reduce las emisiones de carbono en 50 toneladas por año y proporciona energía limpia a 100 familias',
      funds: 1000,
      category: 'Energía Renovable',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
      progress: 75,
      creator: {
        name: 'Ana Martínez',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200'
      },
      daysLeft: 15
    },
    {
      id: '2',
      title: 'Iniciativa de Reforestación',
      description: 'Plantación de 10,000 árboles en áreas deforestadas para restaurar ecosistemas locales. Un proyecto comunitario para recuperar nuestros bosques y combatir el cambio climático.',
      impact: 'Crea nuevo hábitat para la vida silvestre y absorbe CO2, mejorando la biodiversidad local',
      funds: 750,
      category: 'Conservación',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      progress: 45,
      creator: {
        name: 'Carlos Ruiz',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'
      },
      daysLeft: 30
    },
    {
      id: '3',
      title: 'Compostaje Comunitario',
      description: 'Implementación de sistema de compostaje comunitario para reducir residuos orgánicos. Una solución innovadora para convertir residuos en recursos valiosos para la comunidad.',
      impact: 'Reduce los residuos enviados a vertederos y produce abono orgánico para jardines locales',
      funds: 500,
      category: 'Residuos Zero',
      image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
      progress: 30,
      creator: {
        name: 'Laura González',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
      },
      daysLeft: 45
    }
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Proyectos Destacados</h2>
            <p className="text-gray-600 max-w-2xl">
              Descubre iniciativas innovadoras que están transformando nuestro planeta. 
              Únete a nosotros para hacer realidad estos proyectos sostenibles.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              Filtrar
            </button>
            <button className="px-6 py-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors font-medium">
              Crear Proyecto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-green-600 text-green-600 font-medium hover:bg-green-50 transition-colors">
            Ver más proyectos
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsList;