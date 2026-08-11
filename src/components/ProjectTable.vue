<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
 * Loading state.
 */
const loading = ref(false)

/*
 * Error message.
 */
const error = ref('')

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
          <th>Client</th>
          <th>Project</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Start Date</th>
          <th>Due Date</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <!-- Project rows -->
        <tr v-for="project in projects" :key="project.id">
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

            <!-- Delete will be implemented next -->
            <button type="button" disabled>Delete</button>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="projects.length === 0">
          <td colspan="7">No projects found.</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
