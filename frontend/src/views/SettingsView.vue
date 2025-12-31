<script setup>
import { Undo2 } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import { getProfile } from '@/hooks/getProfile';
import { RouterLink } from 'vue-router';
import { Pen } from 'lucide-vue-next';
import TheButton from '@/components/buttons/TheButton.vue';
import TheLogoutButton from '@/components/buttons/TheLogoutButton.vue';

const profile = ref({});
const error = ref(null);
const loading = ref(true);

onMounted(async () => {
    const profileData = await getProfile();
    profile.value = profileData.user;
    error.value = profileData.error;
    loading.value = profileData.loading;
    console.log('Profile data:', profileData);
});

</script>

<template>
    <div class="container p-2">
        <div class="relative flex flex-col items-center p-2">

            <RouterLink to="/profile" class="absolute left-2 top-2">
                <Undo2 class="w-6 h-6 text-purple" />
            </RouterLink>

            <div class="flex flex-col items-center gap-4 pt-8 mt-4">
                <div>
                    <h1 class="font-bold text-2xl mb-4 text-center">Your Personal Settings</h1>
                    <p class="mb-4 text-center">
                        Find all your personal information and settings here.
                    </p>
                </div>
                <div class="mt-6 mb-6 bg-purple rounded-lg p-4 text-white">
                    <div>
                        <div class="flex flex-row gap-4">
                            <p class="font-medium">Username: </p>
                            <p>{{ profile.pseudo }}</p>
                        </div>
                        <div class="flex flex-row gap-4 mt-2">
                            <p class="font-medium">Email: </p>
                            <p>{{ profile.email }}</p>
                        </div>
                    </div>
                    <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>
                    <div v-if="loading" class="text-white mt-2">Loading...</div>
                </div>
                <div>
                    <RouterLink to="/modifyProfile" class="flex items-center gap-2 text-purple underline">
                        <Pen class="w-4 h-4" />
                        <span>Edit your settings</span>
                    </RouterLink>
                </div>

                <div class="mt-40">
                    <TheLogoutButton />
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped></style>