<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const videoElement = ref(null);
const canvasElement = ref(null);
const stream = ref(null);

// Démarrer la caméra au chargement
onMounted(async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }, // Caméra arrière sur mobile
    });
    if (videoElement.value) {
      videoElement.value.srcObject = stream.value;
    }
  } catch (error) {
    alert("Unable to access camera: " + error.message);
  }
});

// Obtenir la position GPS
const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    } else {
      reject(new Error('Geolocation not supported'));
    }
  });
};

// Prendre la photo
const capturePhoto = async () => {
  if (!videoElement.value || !canvasElement.value) return;

  // Capturer la position GPS d'abord
  let location = null;
  try {
    location = await getLocation();
  } catch (error) {
    alert('Unable to get GPS location: ' + error.message);
    return;
  }

  const canvas = canvasElement.value;
  const video = videoElement.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0);

  // Convertir en blob
  canvas.toBlob((blob) => {
    // Arrêter la caméra
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop());
    }

    // Passer à la page de création avec l'image ET la position
    const imageUrl = URL.createObjectURL(blob);
    router.push({
      name: "createPost",
      state: { image: blob, imagePreview: imageUrl, location },
    });
  }, "image/jpeg");
};

// Utiliser une image de la galerie
const selectFromGallery = async () => {
  // Capturer la position GPS d'abord
  let location = null;
  try {
    location = await getLocation();
  } catch (error) {
    alert('Unable to get GPS location: ' + error.message);
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Arrêter la caméra
      if (stream.value) {
        stream.value.getTracks().forEach((track) => track.stop());
      }

      const imageUrl = URL.createObjectURL(file);
      router.push({
        name: "createPost",
        state: { image: file, imagePreview: imageUrl, location },
      });
    }
  };

  input.click();
};
</script>

<template>
  <div class="camera-container">
    <h1>Take a Photo</h1>

    <!-- Flux vidéo de la caméra -->
    <video ref="videoElement" autoplay playsinline></video>

    <!-- Canvas caché pour capturer l'image -->
    <canvas ref="canvasElement" style="display: none"></canvas>

    <!-- Boutons -->
    <div class="button-group">
      <button @click="capturePhoto" class="btn-capture">Take Photo</button>
      <button @click="selectFromGallery" class="btn-gallery">Gallery</button>
    </div>
  </div>
</template>

<style scoped>
.camera-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

video {
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-capture {
  background-color: #4caf50;
  color: white;
}

.btn-gallery {
  background-color: #2196f3;
  color: white;
}
</style>
