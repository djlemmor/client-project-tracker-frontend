<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'
import type { Project } from '../types/project'

/*
 * Tell the parent component when the user
 * wants to edit a project.
 */
const emit = defineEmits(['edit'])

/*
 * List of projects retrieved from Laravel.
 */
const projects = ref<Project[]>([])

/*
 * Stores the text entered into the search box.
 */
const searchQuery = ref('')

/*
 * Currently selected status filter.
 *
 * Empty string means "all statuses".
 */
const statusFilter = ref('')

/*
 * Currently selected priority filter.
 *
 * Empty string means "all priorities".
 */
const priorityFilter = ref('')

/*
 * Current column used for sorting.
 */
const sortField = ref<keyof Project | null>(null)

/*
 * Current sorting direction.
 *
 * Possible values:
 *
 * - asc
 * - desc
 */
const sortDirection = ref<'asc' | 'desc'>('asc')

/*
 * Loading state.
 */
const loading = ref(false)

/*
 * Error message.
 */
const error = ref('')

/*
 * Stores the project currently being deleted.
 *
 * This is useful because we want to disable
 * the delete button while the request is running.
 */
const deletingProjectId = ref<number | null>(null)

/**
 * Retrieve all projects from the API.
 */
const fetchProjects = async () => {
  loading.value = true
  error.value = ''

  try {
    /*
     * GET /api/projects
     */
    const response = await api.get('/projects')

    /*
     * Laravel returns:
     *
     * {
     *     data: [...]
     * }
     *
     * Therefore we access response.data.data.
     */
    projects.value = response.data.data
  } catch (err) {
    error.value = 'Unable to load projects.'

    console.error(err)
  } finally {
    loading.value = false
  }
}

/**
 * Delete a project.
 *
 * @param project The project the user wants to delete.
 */
const deleteProject = async (project: Project) => {
  /*
   * Ask the user for confirmation before
   * permanently deleting the project.
   */
  const confirmed = window.confirm(`Are you sure you want to delete "${project.project_name}"?`)

  /*
   * If the user clicked Cancel,
   * stop here.
   */
  if (!confirmed) {
    return
  }

  /*
   * Remember which project is currently
   * being deleted.
   */
  deletingProjectId.value = project.id

  try {
    /*
     * Send:
     *
     * DELETE /api/projects/{id}
     */
    await api.delete(`/projects/${project.id}`)

    /*
     * Remove the deleted project from
     * the local list immediately.
     *
     * This avoids another API request.
     */
    projects.value = projects.value.filter((item) => item.id !== project.id)
  } catch (err) {
    /*
     * Show an error if deletion fails.
     */
    error.value = 'Unable to delete project.'

    console.error(err)
  } finally {
    /*
     * Allow delete buttons to work again.
     */
    deletingProjectId.value = null
  }
}

/*
 * Filter projects based on the search query.
 *
 * We search both:
 *
 * - Client name
 * - Project name
 * - Apply search, status, and priority filters.
 * - Filter and sort projects.
 */

const filteredProjects = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  /*
   * First apply filters.
   */
  const filtered = projects.value.filter((project) => {
    const matchesSearch =
      !query ||
      project.client_name.toLowerCase().includes(query) ||
      project.project_name.toLowerCase().includes(query)

    const matchesStatus = !statusFilter.value || project.status === statusFilter.value

    const matchesPriority = !priorityFilter.value || project.priority === priorityFilter.value

    return matchesSearch && matchesStatus && matchesPriority
  })

  /*
   * If no sorting has been selected,
   * return the filtered data as-is.
   */
  if (!sortField.value) {
    return filtered
  }

  const field = sortField.value
  if (!field) {
    return filtered
  }

  /*
   * Create a copy before sorting.
   *
   * This prevents us from modifying
   * the original projects array.
   */
  return [...filtered].sort((a, b) => {
    let valueA = a[field]
    let valueB = b[field]

    /*
     * Convert null/undefined values into
     * empty strings so comparisons don't fail.
     */
    valueA = valueA ?? ''
    valueB = valueB ?? ''

    /*
     * Convert strings to lowercase so
     * sorting isn't case-sensitive.
     */
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase()
    }

    if (typeof valueB === 'string') {
      valueB = valueB.toLowerCase()
    }

    /*
     * Determine the sorting result.
     */
    if (valueA < valueB) {
      return sortDirection.value === 'asc' ? -1 : 1
    }

    if (valueA > valueB) {
      return sortDirection.value === 'asc' ? 1 : -1
    }

    return 0
  })
})

/**
 * Change the active sorting column.
 *
 * @param field Database/project field to sort by.
 */
const sortBy = (field: keyof Project) => {
  /*
   * If the user clicks the same column,
   * reverse the direction.
   */
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'

    return
  }

  /*
   * Otherwise select the new column
   * and start with ascending order.
   */
  sortField.value = field
  sortDirection.value = 'asc'
}

/*
 * Allow the parent component to refresh
 * the table after creating/updating a project.
 */
defineExpose({
  fetchProjects,
})

/*
 * Fetch projects when the component
 * is initially mounted.
 */
onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <!-- Search -->
  <div class="search-container">
    <label for="search"> Search Projects </label>

    <input
      id="search"
      v-model="searchQuery"
      type="search"
      placeholder="Search by client or project..."
    />
  </div>

  <!-- Filters -->
  <div class="filters">
    <!-- Status filter -->
    <div>
      <label for="status-filter"> Status </label>

      <select id="status-filter" v-model="statusFilter">
        <option value="">All Statuses</option>

        <option value="Planning">Planning</option>

        <option value="In Progress">In Progress</option>

        <option value="On Hold">On Hold</option>

        <option value="Completed">Completed</option>
      </select>
    </div>

    <!-- Priority filter -->
    <div>
      <label for="priority-filter"> Priority </label>

      <select id="priority-filter" v-model="priorityFilter">
        <option value="">All Priorities</option>

        <option value="Low">Low</option>

        <option value="Medium">Medium</option>

        <option value="High">High</option>
      </select>
    </div>
  </div>

  <!-- Project Table -->
  <section class="project-table">
    <h2>Projects</h2>

    <!-- Loading state -->
    <p v-if="loading">Loading projects...</p>

    <!-- Error state -->
    <p v-else-if="error" class="error">
      {{ error }}
    </p>

    <table v-else>
      <thead>
        <tr>
          <th>
            <button type="button" class="sort-button" @click="sortBy('client_name')">Client</button>
          </th>
          <th>
            <button type="button" class="sort-button" @click="sortBy('project_name')">
              Project
            </button>
          </th>
          <th>Status</th>
          <th>Priority</th>
          <th>
            <button type="button" class="sort-button" @click="sortBy('start_date')">
              Start Date
            </button>
          </th>
          <th>
            <button type="button" class="sort-button" @click="sortBy('due_date')">Due Date</button>
          </th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <!-- Project rows -->
        <tr v-for="project in filteredProjects" :key="project.id">
          <td>
            {{ project.client_name }}
          </td>

          <td>
            {{ project.project_name }}
          </td>

          <td>
            {{ project.status }}
          </td>

          <td>
            {{ project.priority }}
          </td>

          <td>
            {{ project.start_date ?? '-' }}
          </td>

          <td>
            {{ project.due_date ?? '-' }}
          </td>

          <td>
            <!-- Edit button -->
            <button type="button" @click="emit('edit', project)">Edit</button>

            <!-- Delete button -->
            <button
              type="button"
              class="delete-button"
              :disabled="deletingProjectId === project.id"
              @click="deleteProject(project)"
            >
              {{ deletingProjectId === project.id ? 'Deleting...' : 'Delete' }}
            </button>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="filteredProjects.length === 0">
          <td colspan="7">No projects found.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
