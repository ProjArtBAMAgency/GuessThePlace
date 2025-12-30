<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Données réactives
const image = ref(null);
const imagePreview = ref(null);
const placeName = ref("");
const location = ref(null);
const isSubmitting = ref(false);

// Récupérer l'image depuis l'état de navigation
onMounted(() => {
  const state = history.state;
  if (state && state.image && state.imagePreview && state.location) {
    image.value = state.image;
    imagePreview.value = state.imagePreview;
    location.value = state.location;
  } else {
    // Si pas d'image ou de position, retourner à la capture
    router.push("/cameraCapture");
  }
});

// Fonction pour supprimer l'image
const removeImage = () => {
  image.value = null;
  imagePreview.value = null;
  router.push("/cameraCapture");
};

// Fonction pour soumettre le formulaire
const submit = async () => {
  if (!image.value || !placeName.value) {
    alert("Please provide an image and a place name");
    return;
  }

  if (!location.value) {
    alert("Please get your current location first");
    return;
  }

  isSubmitting.value = true;

  try {
    // Créer le FormData pour envoyer l'image, le nom et les coordonnées
    const formData = new FormData();
    formData.append("picture", image.value);
    formData.append("placeName", placeName.value);
    formData.append("latitude", location.value.latitude);
    formData.append("longitude", location.value.longitude);

    // Appel API pour créer le post
    const response = await fetch("http://localhost:3000/api/v1/posts", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to create post");
    }

    const result = await response.json();
    console.log("Post created:", result);

    // Afficher un message de succès
    alert(
      "Location submitted successfully! It will be reviewed by an administrator."
    );

    // Rediriger vers la page d'accueil
    router.push("/");
  } catch (error) {
    console.error("Error creating post:", error);
    alert("Failed to submit location. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="create-post-container">
    <!-- Titre -->
    <h1>SUBMIT A LOCATION</h1>

    <!-- Description -->
    <p class="description">
      Share your discoveries! Take a photo of an interesting location and submit
      it to be added to the game.
    </p>

    <!-- Aperçu de l'image (si disponible) -->
    <div v-if="image" class="image-preview">
      <img :src="imagePreview" alt="Preview" />
      <button @click="removeImage" class="btn-remove">✕</button>
    </div>

    <!-- Formulaire -->
    <div class="form-group">
      <label for="placeName">Name of place *</label>
      <input
        id="placeName"
        type="text"
        v-model="placeName"
        placeholder="Name of place*"
        class="input-field"
      />
    </div>

    <!-- Info position GPS -->
    <div class="gps-info">
      <p v-if="location" class="gps-success">GPS coordinates captured</p>
      <p v-else class="gps-loading">Getting GPS coordinates...</p>
    </div>

    <!-- Bouton soumettre -->
    <button
      @click="submit"
      :disabled="!location || isSubmitting"
      class="btn-submit"
    >
      {{ isSubmitting ? "Submitting..." : "Submit Location" }}
    </button>

    <!-- Note -->
    <div class="note">
      <strong>⚠️ Note:</strong>
      All submissions are verified by an administrator before being added to the
      game. Make sure your GPS coordinates are accurate!
    </div>
  </div>
</template>

<style scoped>
.create-post-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.description {
  text-align: center;
  color: #666;
  line-height: 1.5;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-preview img {
  width: 100%;
  display: block;
}

.btn-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 59, 48, 0.9);
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.btn-remove:hover {
  background-color: rgba(255, 59, 48, 1);
}

.form-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #333;
}

.input-field {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #684bf3;
}

.gps-info {
  width: 100%;
  text-align: center;
}

.gps-success {
  color: #684bf3;
  font-weight: 600;
}

.gps-loading {
  color: #abd6ff;
  font-weight: 600;
}

.btn-submit {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  background-color: #684bf3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #684bf3;
}

.btn-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.note {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 1rem;
  text-align: left;
  color: #856404;
  line-height: 1.5;
}

.note strong {
  display: block;
  margin-bottom: 0.5rem;
}
</style>
