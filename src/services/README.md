# Tag Service Documentation

Сервис для работы с тегами в PocketBase с поддержкой CRUD операций и WebSocket подписок для получения изменений в реальном времени.

## Структура

- **tag.service.ts** - Функции для работы с API тегов
- **stores/tag.ts** - Pinia store для управления состоянием тегов

## Использование

### 1. Базовые CRUD операции

```typescript
import { createTag, deleteTag, getTag, getTags, updateTag } from '~/services/tag.service'

// Создание тега
const newTag = await createTag({
	name: 'My Tag',
	creator: 'USER_ID'
})

// Получение тега по ID
const tag = await getTag('RECORD_ID')

// Получение всех тегов
const allTags = await getAllTags()

// Получение тегов с фильтрацией
const filteredTags = await getTags('name ~ "test"', '-created')

// Обновление тега
const updatedTag = await updateTag('RECORD_ID', {
	name: 'Updated Name'
})

// Удаление тега
await deleteTag('RECORD_ID')
```

### 2. WebSocket подписки

```typescript
import { subscribeToAllTags, subscribeToTag, unsubscribeFromTags } from '~/services/tag.service'

// Подписка на все изменения тегов
const unsubscribe = await subscribeToAllTags((data) => {
	console.log('Action:', data.action) // 'create' | 'update' | 'delete'
	console.log('Record:', data.record)
})

// Подписка на конкретный тег
const unsubscribeOne = await subscribeToTag('RECORD_ID', (data) => {
	console.log('Tag updated:', data.record)
})

// Отписка
unsubscribe() // или
unsubscribeFromTags('RECORD_ID')
unsubscribeFromTags('*') // отписка от всех '*' подписок
unsubscribeFromAllTags() // отписка от всех подписок
```

### 3. Использование в Vue компонентах (Pinia Store)

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useTagStore } from '~/stores/tag'

const tagStore = useTagStore()
const { tags, isLoading, error, currentUserId, isSubscribed } = storeToRefs(tagStore)

// Загрузка тегов и подписка на изменения
onMounted(async () => {
	await tagStore.fetchAll()
	await tagStore.subscribe()
})

// Очистка при размонтировании
onUnmounted(() => {
	tagStore.unsubscribe()
})

// Создание тега
async function createNewTag() {
	await tagStore.create({
		name: 'New Tag',
		creator: currentUserId.value
	})
}

// Обновление тега
async function updateExisting(id: string) {
	await tagStore.update(id, { name: 'Updated Name' })
}

// Удаление тега
async function deleteExisting(id: string) {
	await tagStore.remove(id)
}
</script>

<template>
	<div v-if="isLoading">
		Loading...
	</div>
	<div v-else-if="error">
		Error: {{ error.message }}
	</div>
	<div v-else>
		<div v-for="tag in tags" :key="tag.id">
			{{ tag.name }}
		</div>
		<p>Subscribed: {{ isSubscribed }}</p>
		<p>Total: {{ tagStore.tagsCount }}</p>
	</div>
</template>
```

### 4. Готовый компонент

Используйте готовый компонент `TagManager`:

```vue
<script setup lang="ts">
import TagManager from '~/components/tag/tag-manager.vue'
</script>

<template>
	<TagManager />
</template>
```

## Опции подписки

```typescript
const options = {
	filter: 'name ~ "test"', // Фильтрация записей
	expand: 'creator', // Расширение связанных полей
	headers: { 'X-Custom': 'value' } // Дополнительные заголовки
}

await subscribeToAllTags(callback, options)
```

## Типы

```typescript
interface Tag {
	id?: string
	name: string
	creator: string
	created?: string
	updated?: string
}

interface TagSubscriptionOptions {
	filter?: string
	expand?: string
	headers?: Record<string, string>
}
```

## Pinia Store API

### State (readonly через storeToRefs)

- **tags** - Реактивный массив тегов
- **currentTag** - Текущий выбранный тег
- **isLoading** - Состояние загрузки
- **error** - Ошибка
- **isSubscribed** - Статус подписки на WebSocket

### Getters

- **tagsCount** - Количество тегов
- **tagById** - Функция для получения тега по ID
- **sortedTags** - Отсортированные по имени теги
- **currentUserId** - ID текущего пользователя

### Actions

- **fetchAll(filter?, sort?)** - Загрузить все теги
- **fetchOne(id)** - Загрузить конкретный тег
- **create(data)** - Создать новый тег
- **update(id, data)** - Обновить тег
- **remove(id)** - Удалить тег
- **subscribe(options?)** - Подписаться на все изменения
- **subscribeOne(id, options?)** - Подписаться на конкретный тег
- **unsubscribe()** - Отписаться от всех подписок
- **clear()** - Очистить все теги из store
- **$reset()** - Сбросить store в начальное состояние

## Примеры событий WebSocket

```typescript
// При создании нового тега
{
  action: 'create',
  record: { id: '...', name: 'New Tag', creator: '...', ... }
}

// При обновлении тега
{
  action: 'update',
  record: { id: '...', name: 'Updated Tag', creator: '...', ... }
}

// При удалении тега
{
  action: 'delete',
  record: { id: '...', name: 'Deleted Tag', creator: '...', ... }
}
```
