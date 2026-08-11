<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import api from '../services/api'
import type { Project } from '../types/project'
import { AxiosError } from 'axios'

/*
 * The parent component will provide the project
 * when we are editing an existing project.
 *
 * When creating a new project, this will be null.
 */
const props = defineProps<{
  project: Project | null
}>()

/*
 * Tell the parent component when:
 *
 * - The form should be closed.
 * - A project was successfully saved.
 */
const emit = defineEmits(['close', 'saved'])

/*
 * Determine whether we are editing an existing
 * project or creating a new one.
 */
const isEditing = computed(() => {
  return props.project !== null
})

/*
 * Form data.
 *
 * reactive() allows Vue to automatically track
 * changes to these fields.
 */
const form = reactive({
  client_name: '',
  project_name: '',
  description: '',
  status: 'Planning',
  priority: 'Medium',
  start_date: '',
  due_date: '',
})

/*
 * Stores frontend validation errors.
 *
 * Example:
 *
 * errors.client_name = 'Client name is required.'
 */
const errors = ref<Record<string, string>>({})

/*
 * Stores validation errors returned by Laravel.
 */
const apiErrors = ref<Record<string, string[]>>({})

/*
 * Controls the submit/loading state.
 */
const submitting = ref(false)

/**
 * Reset the form to its default values.
 */
const resetForm = () => {
  form.client_name = ''
  form.project_name = ''
  form.description = ''
  form.status = 'Planning'
  form.priority = 'Medium'
  form.start_date = ''
  form.due_date = ''
}

/*
 * Watch the project prop.
 *
 * This allows the same form to be used for:
 *
 * - Creating a project
 * - Editing a project
 */
watch(
  () => props.project,
  (project) => {
    if (project) {
      /*
       * Populate the form with the selected
       * project's existing values.
       */
      form.client_name = project.client_name ?? ''
      form.project_name = project.project_name ?? ''
      form.description = project.description ?? ''
      form.status = project.status ?? 'Planning'
      form.priority = project.priority ?? 'Medium'

      /*
       * Laravel may return dates as strings.
       *
       * We only need YYYY-MM-DD for
       * the HTML date input.
       */
      form.start_date = project.start_date ? project.start_date.substring(0, 10) : ''

      form.due_date = project.due_date ? project.due_date.substring(0, 10) : ''
    } else {
      /*
       * Reset the form when creating
       * a new project.
       */
      resetForm()
    }

    /*
     * Clear previous errors whenever
     * the selected project changes.
     */
    errors.value = {}
    apiErrors.value = {}
  },
  {
    immediate: true,
  },
)

/**
 * Perform frontend validation.
 *
 * This gives the user immediate feedback
 * without making an unnecessary API request.
 */
const validateForm = () => {
  errors.value = {}

  /*
   * Client name is required.
   */
  if (!form.client_name.trim()) {
    errors.value.client_name = 'Client name is required.'
  }

  /*
   * Project name is required.
   */
  if (!form.project_name.trim()) {
    errors.value.project_name = 'Project name is required.'
  }

  /*
   * Due date cannot be before start date.
   */
  if (form.start_date && form.due_date && form.due_date < form.start_date) {
    errors.value.due_date = 'Due date cannot be before start date.'
  }

  /*
   * Return true if there are no errors.
   */
  return Object.keys(errors.value).length === 0
}

/**
 * Submit the project form.
 */
const submitForm = async () => {
  /*
   * Validate the form before making
   * an API request.
   */
  if (!validateForm()) {
    return
  }

  submitting.value = true

  /*
   * Clear old API validation errors.
   */
  apiErrors.value = {}

  try {
    /*
     * Create a copy of the form data.
     *
     * This prevents us from accidentally
     * modifying our reactive form object.
     */
    const payload = {
      ...form,
    }

    let response

    if (isEditing.value) {
      /*
       * Update an existing project.
       *
       * PUT /api/projects/{id}
       */
      response = await api.put(`/projects/${props.project?.id}`, payload)
    } else {
      /*
       * Create a new project.
       *
       * POST /api/projects
       */
      response = await api.post('/projects', payload)
    }

    /*
     * Tell the parent that the project
     * was successfully saved.
     */
    emit('saved', response.data.data)

    /*
     * Close the form.
     */
    emit('close')
  } catch (error) {
    /*
     * Laravel validation errors normally
     * have HTTP status 422.
     */
    // Use AxiosError to correctly type the error
    if (error instanceof AxiosError && error.response?.status === 422) {
      apiErrors.value = error.response.data.errors ?? {}
    } else {
      /*
       * Log unexpected errors so they can
       * be investigated during development.
       */
      console.error(error)
    }
  } finally {
    /*
     * Re-enable the submit button.
     */
    submitting.value = false
  }
}
</script>

<template>
  <div class="project-form">
    <!-- Form heading -->
    <h2>
      {{ isEditing ? 'Edit Project' : 'Create Project' }}
    </h2>

    <form @submit.prevent="submitForm">
      <!-- Client Name -->
      <div class="form-group">
        <label for="client_name"> Client Name * </label>

        <input
          id="client_name"
          v-model="form.client_name"
          type="text"
          placeholder="Enter client name"
        />

        <!-- Frontend validation error -->
        <small v-if="errors.client_name" class="error">
          {{ errors.client_name }}
        </small>

        <!-- Laravel validation error -->
        <small v-if="apiErrors.client_name" class="error">
          {{ apiErrors.client_name[0] }}
        </small>
      </div>

      <!-- Project Name -->
      <div class="form-group">
        <label for="project_name"> Project Name * </label>

        <input
          id="project_name"
          v-model="form.project_name"
          type="text"
          placeholder="Enter project name"
        />

        <small v-if="errors.project_name" class="error">
          {{ errors.project_name }}
        </small>

        <small v-if="apiErrors.project_name" class="error">
          {{ apiErrors.project_name[0] }}
        </small>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description"> Description </label>

        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          placeholder="Enter project description"
        ></textarea>

        <small v-if="apiErrors.description" class="error">
          {{ apiErrors.description[0] }}
        </small>
      </div>

      <!-- Status -->
      <div class="form-group">
        <label for="status"> Status * </label>

        <select id="status" v-model="form.status">
          <option value="Planning">Planning</option>

          <option value="In Progress">In Progress</option>

          <option value="On Hold">On Hold</option>

          <option value="Completed">Completed</option>
        </select>

        <small v-if="apiErrors.status" class="error">
          {{ apiErrors.status[0] }}
        </small>
      </div>

      <!-- Priority -->
      <div class="form-group">
        <label for="priority"> Priority * </label>

        <select id="priority" v-model="form.priority">
          <option value="Low">Low</option>

          <option value="Medium">Medium</option>

          <option value="High">High</option>
        </select>

        <small v-if="apiErrors.priority" class="error">
          {{ apiErrors.priority[0] }}
        </small>
      </div>

      <!-- Start Date -->
      <div class="form-group">
        <label for="start_date"> Start Date </label>

        <input id="start_date" v-model="form.start_date" type="date" />

        <small v-if="apiErrors.start_date" class="error">
          {{ apiErrors.start_date[0] }}
        </small>
      </div>

      <!-- Due Date -->
      <div class="form-group">
        <label for="due_date"> Due Date </label>

        <input id="due_date" v-model="form.due_date" type="date" />

        <small v-if="errors.due_date" class="error">
          {{ errors.due_date }}
        </small>

        <small v-if="apiErrors.due_date" class="error">
          {{ apiErrors.due_date[0] }}
        </small>
      </div>

      <!-- Form actions -->
      <div class="form-actions">
        <!-- Cancel button -->
        <button type="button" @click="emit('close')" :disabled="submitting">Cancel</button>

        <!-- Submit button -->
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project' }}
        </button>
      </div>
    </form>
  </div>
</template>
