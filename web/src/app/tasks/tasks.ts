import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type TaskItem = {
  _id: string;
  name: string;
  status: 'todo' | 'in_progress' | 'done';
  projectId?: string;
  project?: ProjectItem | null;
};

type ProjectItem = {
  _id: string;
  name: string;
};

type SortField = 'createdAt' | 'status' | 'projectId';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent {
  private readonly apiUrl = '/api/tasks';
  private readonly projectsUrl = '/api/projects';

  tasks: TaskItem[] = [];
  projects: ProjectItem[] = [];
  statusMessage = '';

  form = {
    name: '',
    projectId: '',
    status: 'todo' as TaskItem['status'],
  };

  projectForm = {
    name: '',
  };

  filters = {
    status: '',
    projectId: '',
    createdFrom: '',
    createdTo: '',
    sortBy: 'createdAt' as SortField,
    sortOrder: 'desc' as SortOrder,
  };

  editingTaskId: string | null = null;
  editForm = {
    name: '',
    status: 'todo' as TaskItem['status'],
    projectId: '',
  };

  constructor(private readonly http: HttpClient) {
    this.loadProjects();
    this.loadTasks();
  }

  loadProjects() {
    this.http.get<ProjectItem[]>(this.projectsUrl).subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: () => {
        this.statusMessage = 'Failed to load projects.';
      },
    });
  }

  loadTasks() {
    this.http.get<TaskItem[]>(this.apiUrl, { params: this.buildQueryParams() }).subscribe({
      next: (data) => {
        this.tasks = data;
      },
      error: () => {
        this.statusMessage = 'Failed to load tasks.';
      },
    });
  }

  applyFilters() {
    this.loadTasks();
  }

  resetFilters() {
    this.filters = {
      status: '',
      projectId: '',
      createdFrom: '',
      createdTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    this.loadTasks();
  }

  createTask() {
    this.statusMessage = '';
    this.http.post<TaskItem>(this.apiUrl, this.form).subscribe({
      next: (task) => {
        this.tasks = [task, ...this.tasks];
        this.form = { name: '', projectId: '', status: 'todo' };
      },
      error: () => {
        this.statusMessage = 'Failed to create task.';
      },
    });
  }

  createProject() {
    this.statusMessage = '';
    this.http.post<ProjectItem>(this.projectsUrl, this.projectForm).subscribe({
      next: (project) => {
        this.projects = [project, ...this.projects];
        this.projectForm = { name: '' };
        this.form.projectId = project._id;
      },
      error: () => {
        this.statusMessage = 'Failed to create project.';
      },
    });
  }

  startEdit(task: TaskItem) {
    this.editingTaskId = task._id;
    this.editForm = {
      name: task.name,
      status: task.status,
      projectId: typeof task.projectId === 'string' ? task.projectId : '',
    };
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.editForm = { name: '', status: 'todo', projectId: '' };
  }

  updateTask(taskId: string) {
    this.statusMessage = '';
    this.http.patch<TaskItem>(`${this.apiUrl}/${taskId}`, this.editForm).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((task) => (task._id === taskId ? updated : task));
        this.cancelEdit();
      },
      error: () => {
        this.statusMessage = 'Failed to update task.';
      },
    });
  }

  private buildQueryParams() {
    const params: Record<string, string> = {};

    if (this.filters.status) {
      params["status"] = this.filters.status;
    }
    if (this.filters.projectId) {
      params["projectId"] = this.filters.projectId;
    }
    if (this.filters.createdFrom) {
      params["createdFrom"] = this.filters.createdFrom;
    }
    if (this.filters.createdTo) {
      params["createdTo"] = this.filters.createdTo;
    }

    params["sortBy"] = this.filters.sortBy;
    params["sortOrder"] = this.filters.sortOrder;

    return params;
  }
}
