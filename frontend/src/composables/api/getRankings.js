import { ref } from 'vue';

export async function getRankings(teamId = null, page = 1, limit = 10) {
    const isLoading = ref(true);
    const error = ref(null);
    const data = ref(null);
        try {
            const url = teamId ? `/api/v1/ranking?team_id=${teamId}&page=${page}&limit=${limit}` : `/api/v1/ranking?page=${page}&limit=${limit}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rankings');
            }

            data.value = await response.json();
            error.value = null;
            isLoading.value = false;
        } catch (err) {
            console.error('Error fetching rankings:', err);
            error.value = 'Failed to fetch rankings';
            data.value = null;
            isLoading.value = false;
        }

    return { data, error, isLoading };
}

export async function getTeams() {
    const isLoading = ref(true);
    const error = ref(null);
    const data = ref(null);

    try {
        const response = await fetch('/api/v1/teams', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch teams IDs');
        }

        data.value = await response.json();
        error.value = null;
        isLoading.value = false;
    } catch (err) {
        console.error('Error fetching teams IDs:', err);
        error.value = 'Failed to fetch teams IDs';
        data.value = null;
        isLoading.value = false;
    }
    return { data, error, isLoading };

}