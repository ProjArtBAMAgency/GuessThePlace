<script setup>
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { ref, onMounted } from 'vue';
import { Edit2 } from 'lucide-vue-next';
import { Trash2 } from 'lucide-vue-next';
import TheInfoButton from '@/components/buttons/TheInfoButton.vue';
import TheDeletePostAlert from '@/components/form/TheDeletePostAlert.vue';

const route = useRoute();
const router = useRouter();
const postId = route.params.postId;

const post = ref(null);
const isError = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);
const isEditing = ref(false);
const showDelete = ref(false);



const fetchPostDetails = async (id) => {
    if (!id) {
        console.error('No post ID provided');
        return;
    }

    try {
        isLoading.value = true;

        const response = await fetch(`/api/v1/posts/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });

        if (!response.ok) {
            console.error(`Failed to fetch post details (status ${response.status})`);
            isError.value = true;
            errorMessage.value = 'Failed to load post details.';
            return;
        }

        post.value = await response.json();
        isError.value = false;
        errorMessage.value = '';
    } catch (error) {
        isError.value = true;
        errorMessage.value = 'An error occurred while fetching post details.';
        console.error('Error fetching post details:', error);
    } finally {
        isLoading.value = false;
    }
};

const toggleEdit = () => {
    isEditing.value = !isEditing.value;
};

const openDelete = () => {
    showDelete.value = true;
};

const handleDeleted = async () => {
    showDelete.value = false;
    await router.push('/profile');
};

const submitChange = async () => {
    if (!post.value) return;

    try {
        const response = await fetch(`/api/v1/posts/${post.value._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ placeName: post.value.placeName }),
        });

        if (!response.ok) {
            console.error(`Failed to update post (status ${response.status})`);
            isError.value = true;
            errorMessage.value = 'Failed to update post.';
            return;
        }

        isError.value = false;
        errorMessage.value = '';
        isEditing.value = false;
    } catch (error) {
        isError.value = true;
        errorMessage.value = 'An error occurred while updating the post.';
        console.error('Error updating post:', error);
    }
};

onMounted(async () => {
    if (!postId) {
        console.error('No post ID found in route parameters.');
        return;
    }
    await fetchPostDetails(postId);
});

</script>

<template>
    <div class="min-h-screen p-4 flex flex-col gap-6 items-center mt-4 overflow-x-hidden">
        <div class="w-full max-w-lg">
            <div class="flex flex-row items-center-safe justify-between mb-4">
                <RouterLink to="/profile" class="text-purple hover:underline  inline-block">
                    ← Back to Profile
                </RouterLink>
                <button @click="openDelete" aria-label="Delete post" class="text-red hover:opacity-80">
                    <Trash2 class="h-5 w-5" />
                </button>
            </div>
            <div v-if="isLoading">
                <p>Loading post details...</p>
            </div>

            <div v-else-if="isError">
                <p class="text-red-500">{{ errorMessage }}</p>
            </div>

            <div v-else-if="post" class="p-2 flex flex-col gap-4 items-center rounded-lg">
                <div class="w-full shadow-md rounded-lg overflow-hidden">
                    <img class="w-full rounded-lg" :src="`/api/v1/posts/${post._id}/picture`" alt="Post Image" />
                </div>

                <div class="w-full flex flex-col gap-2 items-center">
                    <div class="flex flex-row gap-4">
                        <p class="font-light text-purple">Place name</p>
                        <TheInfoButton label="The place name is private, only you can see it." />
                    </div>

                    <div v-if="!isEditing" class="w-full flex items-center justify-between gap-4 min-w-0">

                        <p
                            class="text-lg flex-1 min-w-0 text-center whitespace-normal wrap-break-words overflow-hidden">
                            {{ post.placeName }}
                        </p>

                        <button @click="toggleEdit" class="shrink-0 text-purple">
                            <Edit2 class="w-5 h-5" />
                        </button>
                    </div>

                    <div v-else class="w-full flex items-center gap-3 min-w-0">
                        <input v-model="post.placeName" type="text"
                            class="flex-1 min-w-0 border border-gray-300 rounded-md p-1" />
                        <button @click="submitChange" class="shrink-0 text-purple font-medium">Save</button>
                    </div>
                    <div v-if="isError" class="text-red-500">{{ errorMessage }}</div>
                </div>

                <div class="flex flex-row gap-6 items-center">
                    <div class="flex flex-col gap-2 items-center">
                        <p class="font-light text-purple">Latitude</p>
                        <p class="text-lg">{{ post.latitude.toFixed(3) }}</p>
                    </div>

                    <div class="flex flex-col gap-2 items-center">
                        <p class="font-light text-purple">Longitude</p>
                        <p class="text-lg">{{ post.longitude.toFixed(3) }}</p>
                    </div>
                </div>
            </div>
        </div>
        <TheDeletePostAlert
            v-if="showDelete"
            :post-id="post?._id"
            v-model:open="showDelete"
            @deleted="handleDeleted"
        />
    </div>
</template>

<style scoped></style>
