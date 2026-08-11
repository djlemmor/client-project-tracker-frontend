<script setup lang="ts">
import ProjectTable from './components/ProjectTable.vue'
</script>

<template>
  <main class="container">
    <!-- Application heading -->
    <header class="page-header">
      <h1>Project Tracker</h1>

      <p>Manage client projects and their status.</p>
    </header>

    <!-- Project list -->
    <ProjectTable />
  </main>
</template>
