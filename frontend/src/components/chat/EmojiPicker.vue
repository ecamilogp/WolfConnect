<script setup lang="ts">
import { computed, ref } from 'vue'
import { QBtn, QIcon, QInput, QMenu, QTab, QTabPanel, QTabPanels, QTabs } from 'quasar'
import { useI18n } from 'vue-i18n'

import { EMOJI_CATEGORIES } from '@/utils/emoji-data'

withDefaults(
  defineProps<{
    icon?: string
    color?: string
    size?: string
    triggerClass?: string
  }>(),
  {
    icon: 'emoji_emotions',
    color: 'grey-6',
    size: undefined,
    triggerClass: undefined,
  },
)

const emit = defineEmits<{ select: [emoji: string] }>()

const { t } = useI18n()

const search = ref('')
const activeCategory = ref(EMOJI_CATEGORIES[0]?.id ?? '')

const filteredEmojis = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (query.length === 0) {
    return null
  }

  return EMOJI_CATEGORIES.flatMap((category) =>
    category.emojis.filter((item) => item.keywords.includes(query)),
  )
})

function handleSelect(emoji: string): void {
  emit('select', emoji)
}
</script>

<template>
  <QBtn
    round
    flat
    dense
    :icon="icon"
    :color="color"
    :size="size"
    :class="triggerClass"
    :aria-label="t('chat.emojiPicker')"
  >
    <QMenu anchor="top middle" self="bottom middle" :offset="[0, 8]" class="emoji-picker-menu">
      <div class="emoji-picker">
        <div class="emoji-picker__search">
          <QInput v-model="search" dense outlined rounded :placeholder="t('chat.emojiSearchPlaceholder')">
            <template #prepend>
              <QIcon name="search" size="16px" />
            </template>
          </QInput>
        </div>

        <div v-if="filteredEmojis" class="emoji-picker__grid emoji-picker__grid--standalone">
          <button
            v-for="item in filteredEmojis"
            :key="item.char"
            type="button"
            class="emoji-picker__emoji"
            :title="item.keywords.split(' ')[0]"
            @click="handleSelect(item.char)"
          >
            {{ item.char }}
          </button>

          <p v-if="filteredEmojis.length === 0" class="emoji-picker__empty">
            {{ t('chat.emojiNoResults') }}
          </p>
        </div>

        <template v-else>
          <QTabs
            v-model="activeCategory"
            dense
            no-caps
            outside-arrows
            mobile-arrows
            active-color="primary"
            indicator-color="primary"
            class="emoji-picker__tabs"
          >
            <QTab
              v-for="category in EMOJI_CATEGORIES"
              :key="category.id"
              :name="category.id"
              :icon="category.icon"
            />
          </QTabs>

          <QTabPanels v-model="activeCategory" class="emoji-picker__panels" animated>
            <QTabPanel
              v-for="category in EMOJI_CATEGORIES"
              :key="category.id"
              :name="category.id"
              class="emoji-picker__panel"
            >
              <div class="emoji-picker__grid">
                <button
                  v-for="item in category.emojis"
                  :key="item.char"
                  type="button"
                  class="emoji-picker__emoji"
                  :title="item.keywords.split(' ')[0]"
                  @click="handleSelect(item.char)"
                >
                  {{ item.char }}
                </button>
              </div>
            </QTabPanel>
          </QTabPanels>
        </template>
      </div>
    </QMenu>
  </QBtn>
</template>

<style scoped>
.emoji-picker-menu {
  border-radius: 16px;
  overflow: hidden;
}

.emoji-picker {
  width: 380px;
  background-color: #ffffff;
}

.body--dark .emoji-picker {
  background-color: var(--q-dark);
}

.emoji-picker__search {
  padding: 10px 12px 8px;
}

.emoji-picker__tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 4px;
}

.body--dark .emoji-picker__tabs {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.emoji-picker__panels {
  height: 260px;
}

.emoji-picker__panel {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
}

.emoji-picker__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.emoji-picker__grid--standalone {
  max-height: 260px;
  overflow-y: auto;
  padding: 8px;
}

.emoji-picker__emoji {
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  padding: 6px 0;
  border-radius: 10px;
  cursor: pointer;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.1s ease, transform 0.1s ease;
}

.emoji-picker__emoji:hover {
  background-color: rgba(0, 0, 0, 0.08);
  transform: scale(1.15);
}

.body--dark .emoji-picker__emoji:hover {
  background-color: rgba(255, 255, 255, 0.14);
}

.emoji-picker__empty {
  grid-column: 1 / -1;
  text-align: center;
  font-size: 13px;
  opacity: 0.6;
  padding: 24px 0;
}
</style>
