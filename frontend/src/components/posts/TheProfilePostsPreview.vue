<script setup>
import { RouterLink } from 'vue-router';
import { ref, onMounted } from 'vue';
import { LoaderCircle } from 'lucide-vue-next';

const page = ref(1);
const pageSize = 12;
const userPosts = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const totalPages = ref(0);

const fetchPage = async (pageNumber) => {
  const skip = (pageNumber - 1) * pageSize;
  const url = `/api/v1/posts/user?limit=${pageSize}&skip=${skip}`;

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Failed to load posts (status ${res.status})`);
  }
  return res.json();
};

const loadPage = async (pageNumber, append) => {
  isLoading.value = true;
  try {
    const data = await fetchPage(pageNumber);
    totalPages.value = data.totalPages || 0;
    if (append) {
      userPosts.value = [...userPosts.value, ...data.posts];
    } else {
      userPosts.value = data.posts;
      console.log('Loaded posts:', userPosts.value);
    }
    page.value = pageNumber;
  } catch (err) {
    console.error('Error fetching user posts:', err);
    errorMessage.value = "Failed to load user posts.";
    totalPages.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const loadMorePosts = async () => {
  if (page.value >= totalPages.value || isLoading.value) return;
  await loadPage(page.value + 1, true);
};

onMounted(async () => {
  await loadPage(1, false);
});
</script>

<template>

  <div v-if="isLoading" class="text-center py-8">
    <p class="mt-4">
      <LoaderCircle class="inline-block w-6 h-6 animate-spin text-purple" /> Loading
    </p>
  </div>
  <div v-if="!isLoading && userPosts.length === 0 && !errorMessage" class="text-center py-8">
    <p>No posts available yet.</p>
  </div>

  <div v-else class="grid md:grid-cols-3 gap-2 grid-cols-2">
    <div v-for="post in userPosts" :key="post._id">
      <RouterLink :to="`/profile/posts/${post._id}`">
        <div class="rounded-lg overflow-hidden shadow-lg hover:shadow-lg transition-shadow duration-300">
          <img :src="`/api/v1/posts/${post._id}/picture`" alt="Post Image" class="w-full h-48 object-cover" />
        </div>
      </RouterLink>
    </div>
  </div>

  <div class="flex justify-center mt-4" v-if="page < totalPages">
    <button class="px-4 py-2 bg-purple text-white rounded disabled:opacity-50" :disabled="isLoading"
      @click="loadMorePosts">
      {{ isLoading ? 'Loading…' : 'Load more' }}
    </button>
  </div>

  <p v-if="errorMessage" class="text-red-500 text-center mt-2">{{ errorMessage }}</p>
</template>

<style scoped></style>
