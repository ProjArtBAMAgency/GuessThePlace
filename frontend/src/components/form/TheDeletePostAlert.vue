<script setup>
import { ref } from 'vue';

const props = defineProps({
    postId: {
        type: String,
        required: true,
    },

    open: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["update:open", "deleted"]);

const isError = ref(false);
const errorMessage = ref("");
const isLoading = ref(false);

const close = () => {
    emit("update:open", false);
};

const deletePost = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    isError.value = false;
    errorMessage.value = "";

    try {
        const response = await fetch(`/api/v1/profile/me/posts/${props.postId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        if (!response.ok) {
            isError.value = true;
            errorMessage.value = "Failed to delete post.";
            return;
        }

        emit("deleted");
        close();
    } catch (error) {
        console.error("Error deleting post:", error);
        isError.value = true;
        errorMessage.value = "An error occurred while deleting the post.";
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
            <h2 class="text-lg font-semibold mb-2">Delete Post</h2>
            <p class="text-sm text-gray-700 mb-4">
                Be careful, this action cannot be undone. Are you sure you want to delete this post?
            </p>

            <div class="flex justify-end gap-2">
                <button
                    @click="close"
                    class="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    @click="deletePost"
                    :disabled="isLoading"
                    class="px-3 py-2 rounded bg-red text-white hover:bg-red-dark disabled:opacity-60"
                >
                    {{ isLoading ? 'Deleting…' : 'Delete' }}
                </button>
            </div>

            <p v-if="isError" class="text-red-600 text-sm mt-3">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<style scoped>

</style>