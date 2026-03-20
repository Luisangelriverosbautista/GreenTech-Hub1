import { useState, useEffect, useCallback } from "react";
import type { Project, NewProject } from "../types";
import { projectService } from "../services/project.service";

export function useProjects(status?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getProjects(status);
      setProjects(data || []);
    } catch (err) {
      console.error('Error loading projects:', err);
      const errorMsg = err instanceof Error ? err.message : "Error al cargar los proyectos";
      setError(errorMsg);
      setProjects([]); // Asegúrate que projects es un array vacío
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  const createProject = async (project: NewProject) => {
    try {
      const newProject = await projectService.createProject(project);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      const errorMessage = err instanceof Error ? err.message : "Error al crear el proyecto";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { projects, isLoading, error, createProject, refreshProjects: loadProjects };
}
