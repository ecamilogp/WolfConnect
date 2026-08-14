<script setup lang="ts">
import { QBtn, QIcon, QItem, QItemSection, QList, QMenu } from 'quasar'

export interface AppActionMenuAction {
  label: string
  icon: string
  color?: string
  handler: () => void
}

withDefaults(
  defineProps<{
    actions: AppActionMenuAction[]
    triggerLabel: string
    loading?: boolean
  }>(),
  { loading: false },
)
</script>

<template>
  <QBtn
    v-if="actions.length > 0"
    round
    flat
    dense
    size="sm"
    icon="more_vert"
    :loading="loading"
    :aria-label="triggerLabel"
  >
    <QMenu anchor="bottom right" self="top right">
      <QList dense class="py-1">
        <QItem
          v-for="action in actions"
          :key="action.label"
          v-close-popup
          clickable
          @click="action.handler"
        >
          <QItemSection avatar class="min-w-0 pr-0">
            <QIcon :name="action.icon" size="18px" :color="action.color" />
          </QItemSection>
          <QItemSection :class="action.color ? `text-${action.color}` : ''">
            {{ action.label }}
          </QItemSection>
        </QItem>
      </QList>
    </QMenu>
  </QBtn>
</template>
