<script setup lang="ts">
import { ref } from 'vue'
import ProjectForm from './components/ProjectForm.vue'
import ProjectTable from './components/ProjectTable.vue'
import type { Project } from './types/project'

/*
 * Reference to the ProjectTable component.
 *
 * We'll use this to refresh the table after
 * creating or updating a project.
 */
const projectTable = ref<InstanceType<typeof ProjectTable> | null>(null)

/*
 * Controls whether the project form is visible.
 */
const showForm = ref(false)

/*
 * Stores the project currently being edited.
 *
 * null means we're creating a new project.
 */
const selectedProject = ref<Project | null>(null)

/**
 * Open the form for creating a new project.
 */
const openCreateForm = () => {
  /*
   * No selected project means
   * we're creating a new one.
   */
  selectedProject.value = null

  /*
   * Display the form.
   */
  showForm.value = true
}

/**
 * Open the form for editing a project.
 *
 * @param project Project selected from the table.
 */
const openEditForm = (project: Project | null) => {
  /*
   * Store the project being edited.
   */
  selectedProject.value = project

  /*
   * Display the form.
   */
  showForm.value = true
}

/**
 * Close the project form.
 */
const closeForm = () => {
  showForm.value = false
  selectedProject.value = null
}

/**
 * Called after a project is successfully
 * created or updated.
 */
const handleProjectSaved = () => {
  /*
   * Refresh the table so the latest
   * database data is displayed.
   */
  projectTable.value?.fetchProjects()
}
</script>

<template>
  <main class="container">
    <!-- Page heading -->
    <header class="page-header">
      <div>
        <h1>Project Tracker</h1>

        <p>Manage client projects and their status.</p>
      </div>

      <!-- Create button -->
      <button type="button" @click="openCreateForm">+ New Project</button>
    </header>

    <!-- Project form -->
    <ProjectForm
      v-if="showForm"
      :project="selectedProject"
      @close="closeForm"
      @saved="handleProjectSaved"
    />

    <!-- Project table -->
    <ProjectTable ref="projectTable" @edit="openEditForm" />
  </main>
</template>
