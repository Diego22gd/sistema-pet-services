<template>
  <div class="flex flex-col min-h-screen">
    <main class="flex-grow">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>