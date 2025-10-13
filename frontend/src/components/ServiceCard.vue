<template>
  <div class="bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition cursor-pointer">
    <img :src="image" alt="service" class="w-full h-40 object-cover rounded-xl mb-4" />
    
    <h3 class="text-lg font-bold text-gray-800">{{ title }}</h3>
    <p class="text-gray-600 text-sm mb-3">{{ description }}</p>
    
    <button class="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
      Reservar
    </button>
  </div>
</template>

<script>
export default {
  name: "ServiceCard",
  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: "https://placehold.co/400x200" }
  }
}
</script>
