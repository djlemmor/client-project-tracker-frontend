<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'
import type { Project } from '../types/project'

/*
 * Stores the list of projects returned
 * by the Laravel API.
 */
const projects = ref<Project[]>([])

/*
 * Controls whether the loading message
 * is displayed.
 */
const loading = ref(false)

/*
 * Stores an error message if the API request fails.
 */
const error = ref('')

/**
 * Fetch all projects from Laravel.
 */
const fetchProjects = async () => {
  // Show loading state before making the request.
  loading.value = true

  // Clear any previous error.
  error.value = ''

  try {
    // Send GET /api/projects.
    const response = await api.get('/projects')

    // Store the returned projects.
    projects.value = response.data.data
  } catch (err) {
    // Display a friendly error message.
    error.value = 'Unable to load projects.'

    // Log the actual error for debugging.
    console.error(err)
  } finally {
    // Hide the loading state.
    loading.value = false
  }
}

/*
 * Fetch projects when the component
 * is first loaded.
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
    <p v-else-if="error">
      {{ error }}
    </p>

    <!-- Project table -->
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
        <!-- Display every project -->
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
            <button>Edit</button>

            <button>Delete</button>
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
