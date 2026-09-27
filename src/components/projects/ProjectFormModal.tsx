import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { createProject, updateProject } from '@/services/projects/projectsService';
import { getFriendlyError } from '@/utils/errors';
import type { Project } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { ProjectForm } from './ProjectForm';

export interface ProjectFormModalProps {
  open: boolean;
  /** When provided the form edits this project instead of creating one. */
  project?: Project | null;
  onClose: () => void;
  onSaved?: (projectId: string) => void;
}

/** Create/edit dialog. Owns its own submit state, toasts and error handling. */
export function ProjectFormModal({ open, project, onClose, onSaved }: ProjectFormModalProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: Parameters<typeof createProject>[1]) => {
    if (!user) {
      setError('You must be signed in to save a project.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (project) {
        await updateProject(user.uid, project.id, values);
        toast.success('Project updated', `“${values.name.trim()}” has been saved.`);
        onClose();
        onSaved?.(project.id);
        return;
      }

      const projectId = await createProject(user.uid, values);
      toast.success('Project created', `“${values.name.trim()}” is now being tracked.`);
      onClose();
      onSaved?.(projectId);
    } catch (submitError) {
      const message = getFriendlyError(submitError, 'We could not save your project. Please try again.');
      setError(message);
      toast.error('Save failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => undefined : onClose}
      title={project ? 'Edit project' : 'Create a project'}
      description={
        project ? 'Update the details, links and progress for this project.' : 'Add a project to start tracking it.'
      }
      size="lg"
      dismissible={!submitting}
    >
      <ProjectForm
        key={project?.id ?? 'new-project'}
        project={project ?? null}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
