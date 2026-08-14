import { ref } from 'vue'

const isOpen = ref(false)
const imageUrl = ref<string | null>(null)
const imageAlt = ref('')

function openImagePreview(url: string, alt = ''): void {
  imageUrl.value = url
  imageAlt.value = alt
  isOpen.value = true
}

function closeImagePreview(): void {
  isOpen.value = false
}

export function useImagePreview() {
  return {
    isOpen,
    imageUrl,
    imageAlt,
    openImagePreview,
    closeImagePreview,
  }
}
