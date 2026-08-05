<script setup lang="ts">
import { computed, ref } from 'vue'
import { QIcon, QInput } from 'quasar'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
    error?: string
    autocomplete?: string
  }>(),
  {
    label: undefined,
    type: 'text',
    error: undefined,
    autocomplete: undefined,
  },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const isPasswordVisible = ref(false)

const resolvedType = computed(() => {
  if (props.type !== 'password') {
    return props.type
  }
  return isPasswordVisible.value ? 'text' : 'password'
})

function togglePasswordVisibility(): void {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <QInput
    :model-value="modelValue"
    :label="label"
    :type="resolvedType"
    :error="Boolean(error)"
    :error-message="error"
    :autocomplete="autocomplete"
    outlined
    dense
    @update:model-value="(value) => $emit('update:modelValue', String(value ?? ''))"
  >
    <template v-if="type === 'password'" #append>
      <QIcon
        :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="togglePasswordVisibility"
      />
    </template>
  </QInput>
</template>
