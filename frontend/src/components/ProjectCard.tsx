import React from 'react';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  showProgress?: boolean;
  compact?: boolean;
  onViewDetails?: () => void;
  onDonate?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  showProgress = true,
  compact = false,
  onViewDetails,
  onDonate
}) => {
  const current = typeof project.currentAmount === 'string' 
    ? parseFloat(project.currentAmount) 
    : (project.currentAmount || 0);
  const meta = project.metaAmount || (project.targetAmount ? parseFloat(project.targetAmount as string) : 1);
  const progress = (current / meta) * 100;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${
      compact ? 'p-4' : 'p-6'
    }`}>
      {project.mediaUrl && !compact && (
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <img
            src={project.mediaUrl}
            alt={project.title}
            className="object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="space-y-3">
        <h3 className={`font-semibold text-gray-900 ${
          compact ? 'text-base' : 'text-lg'
        }`}>
          {project.title}
        </h3>
        
        {!compact && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {project.description}
          </p>
        )}

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Recaudado</span>
              <span className="font-medium text-gray-900">
                {project.currentAmount} / {project.metaAmount} XLM
              </span>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(progress)}% completado</span>
              {project.status === 'active' && (
                <span>{project.transactions?.length || 0} donaciones</span>
              )}
            </div>
          </div>
        )}

        {!compact && (
          <div className="flex gap-2 mt-4">
            <button 
              onClick={onViewDetails}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ver Detalles
            </button>
            {project.status === 'active' && (
              <button 
                onClick={onDonate}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Donar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};