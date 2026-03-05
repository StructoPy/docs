# Pinia Colada - Estado Asíncrono en Structo

Pinia Colada es una librería que proporciona funcionalidades de **React Query** para Vue, integrada nativamente con Pinia. En Structo la utilizamos para manejar el estado del servidor (server state) de manera eficiente, reemplazando el patrón tradicional de "fetch-and-store" con un enfoque de cacheo automático, invalidación y sincronización.

## ¿Por Qué Pinia Colada?

### Comparación con Alternativas

| Característica | Pinia Colada | useFetch (Nuxt) | Pinia Simple |
|----------------|--------------|-----------------|--------------|
| Cacheo automático | ✅ | ❌ | ❌ |
| Invalidación automática | ✅ | ❌ | ❌ |
| Deduplicación de peticiones | ✅ | ❌ | ❌ |
| Integración con Pinia | ✅ | ❌ | ✅ |
| Tipo-safe completo | ✅ | Parcial | ✅ |
| Mutaciones con invalidación | ✅ | ❌ | Manual |
| Optimistic updates | ✅ | ❌ | Manual |

### Ventajas Principales

1. **Cacheo Inteligente**: Los datos se cachean automáticamente. Si vuelves a una página, no se vuelve a fetcher si los datos siguen "frescos".
2. **Invalidación Declarativa**: Cuando mutas datos (CREATE/UPDATE/DELETE), puedes especificar qué queries invalidar automáticamente.
3. **Menos Código Boilerplate**: No necesitas crear actions en stores para cada petición HTTP.
4. **Estados de Carga y Error**: Acceso directo a `isLoading`, `isError`, `error`, `data`.
5. **Refetch Manual**: Función `refetch()` disponible para forzar actualización.

---

## El Wrapper de Structo: `usePiniaQuery.ts`

Located at: `frontend/app/composables/usePiniaQuery.ts`

Este archivo exporta un conjunto de hooks que encapsulan la funcionalidad de Pinia Colada con nuestra capa de API. Proporciona una interfaz type-safe para hacer queries y mutations HTTP.

### Hooks Disponibles

| Hook | Descripción |
|------|-------------|
| `useApiQuery` | GET requests con cacheo automático |
| `useApiPostMutation` | POST requests con invalidación de cache |
| `useApiPutMutation` | PUT requests con invalidación de cache |
| `useApiPatchMutation` | PATCH requests con invalidación de cache |
| `useApiDeleteMutation` | DELETE requests con invalidación de cache |
| `useInvalidateQueries` | Invalidar queries manualmente |
| `useSetQueryData` | Actualizar datos del cache directamente |
| `useGetQueryData` | Leer datos del cache sin hacer fetch |

---

## Ejemplos de Uso

### Query Básico (GET con cacheo)

```typescript
// En BudgetStore.ts
const getBudgets = (params?: BudgetFetchParams) => {
  return useApiQuery<PaginatedResponse<BudgetModel>>(
    () => ['budget', JSON.stringify(params)],  // Query key
    () => {                                     // Endpoint
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value))
          }
        })
      }
      return `/budget${searchParams ? `?${searchParams}` : ''}`
    }
  )
}
```

**Uso en componente:**
```vue
<script setup lang="ts">
const { data, isLoading, error, refresh } = store.getBudgets({ page: 1, pageSize: 10 })
</script>

<template>
  <div v-if="isLoading">Cargando...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>{{ data }}</div>
  <v-btn @click="refresh()">Actualizar</v-btn>
</template>
```

### Query con Condición de Habilitación

```typescript
// En ContractStore.ts
const getById = (id: string) => {
  const { data, isLoading, error, refresh, refetch } =
    useApiQuery<ContractModel>(
      () => ['contracts', id],                    // Key basada en ID
      () => `/contracts/${id}`,                    // Endpoint dinámico
      { enabled: () => Boolean(id) }              // Solo ejecutar si hay ID
    )

  return { data, isLoading, error, refresh, refetch }
}
```

### Mutation con Invalidación Automática (POST)

```typescript
// En BudgetStore.ts
const create = (options?: {
  onSuccess?: (data: BudgetModel) => void
  onError?: (error: ApiError) => void
}) => {
  return useApiPostMutation<BudgetModel, BudgetModel>(() => '/budget', {
    invalidateKeys: ['budget'],  // Invalidar cache de budgets al crear
    ...options,
  })
}
```

**Uso en componente:**
```vue
<script setup lang="ts">
const { mutate, isLoading } = store.create({
  onSuccess: (data) => {
    console.log('Presupuesto creado:', data)
  }
})

const handleCreate = () => {
  mutate({ name: 'Nuevo Presupuesto', globalGainCoefficient: 1.1 })
}
</script>

<template>
  <v-btn :loading="isLoading" @click="handleCreate">Crear</v-btn>
</template>
```

### Mutation con Endpoint Dinámico (PUT)

```typescript
// En BudgetStore.ts
const updateBudget = () => {
  return useApiPutMutation<BudgetModel, BudgetUpdateRequest>(
    (variables) => `/budget/${variables.id}`,  // Endpoint basado en variables
    {
      onSuccess: (data, variables) => {
        invalidateQueries(['budget'])
        invalidateQueries(['budget', String(variables.id)])
      },
    }
  )
}
```

### Mutation con Invalidación Múltiple (DELETE)

```typescript
// En ContractStore.ts
const deleteContract = () =>
  useApiDeleteMutation<ContractModel, { id: number }>(
    (variables) => `/contracts/${variables.id}`,
    {
      onSuccess: () => {
        invalidateQueries(['contracts'])
      },
    }
  )
```

### Invalidación Manual

```typescript
// En BudgetStore.ts
const { invalidateQueries } = useInvalidateQueries()

// Invalidar una query
invalidateQueries('budget')

// Invalidar múltiples queries
invalidateQueries(['budget', 'contract'])

// Invalidar todas las queries
invalidateQueries()
```

### Actualización Directa del Cache (Optimistic Update)

```typescript
const { setQueryData } = useSetQueryData()

// Actualizar directamente los datos cacheados
setQueryData('budget', (oldData) => {
  return {
    ...oldData,
    items: [...oldData.items, newBudget]
  }
})
```

### Lectura del Cache Sin Fetch

```typescript
const { getQueryData } = useGetQueryData()

// Obtener datos sin hacer petición
const cachedBudget = getQueryData<BudgetModel>(['budget', '123'])
if (cachedBudget) {
  console.log('Datos en cache:', cachedBudget)
}
```

---

## Integración con Stores de Pinia

Los hooks de Pinia Colada se utilizan **dentro** de stores de Pinia definidos con la sintaxis de Setup Store:

```typescript
export const useBudgetStore = defineStore('budgetStore', () => {
  const { invalidateQueries } = useInvalidateQueries()

  // Query
  const getBudgets = (params?: BudgetFetchParams) => {
    return useApiQuery(...)
  }

  // Mutation factory
  const create = (options?) => {
    return useApiPostMutation(...)
  }

  return {
    getBudgets,
    create,
    // ...
  }
})
```

Esto permite que los componentes consuman los stores de forma limpia:

```vue
<script setup lang="ts">
const budgetStore = useBudgetStore()
const { data, isLoading } = budgetStore.getBudgets()
</script>
```

---

## Mejores Prácticas

### 1. Keys de Query Significativos

Usa keys que identifiquen inequívocamente los datos:

```typescript
// ✅ Bien: específico y descriptivo
() => ['budget', id]
() => ['contracts', 'list', JSON.stringify(params)]

// ❌ Mal: genérico
() => ['data']
() => ['query']
```

### 2. Invalidar Solo Lo Necesario

Al invalidar queries, especifica las keys exactas:

```typescript
// ✅ Bien: específico
invalidateKeys: ['budget']
invalidateKeys: ['budget', String(id)]

// ❌ Mal: invalida todo el cache
invalidateKeys: '*'
```

### 3. Manejar Estados de Error

Siempre maneja `isLoading`, `isError`, y `error` en los componentes:

```typescript
const { data, isLoading, error } = store.getBudgets()
```

### 4. Usar `enabled` para Control de Ejecución

Controla cuándo se ejecuta la query con el parámetro `enabled`:

```typescript
useApiQuery(
  () => ['budget', id],
  () => `/budget/${id}`,
  { enabled: () => Boolean(id && constructionId.value) }
)
```

### 5. No Mutar Datos Directamente

No modifiques `data.value` directamente. Usa `setQueryData` o re-fetchea:

```typescript
// ❌ Mal: mutación directa
data.value.items.push(newItem)

// ✅ Bien: actualizar via setQueryData
setQueryData(['budget', id], (old) => ({
  ...old,
  items: [...old.items, newItem]
}))
```

---

## Configuración Adicional

### Opciones de Query

Pinia Colada soporta opciones adicionales que puedes pasar a `useApiQuery`:

```typescript
useApiQuery(
  () => ['budget'],
  () => '/budget',
  {
    enabled: () => isAuthenticated.value,
    staleTime: 5 * 60 * 1000,    // 5 minutos
    refetchOnWindowFocus: false, // No refetch al ganar foco
    select: (data) => data.items // Transformar datos
  }
)
```

### Opciones de Mutation

```typescript
useApiPostMutation(
  () => '/budget',
  {
    invalidateKeys: ['budget'],
    onSuccess: (data, vars) => { /* ... */ },
    onError: (error, vars) => { /* ... */ },
    onSettled: (data, error, vars) => { /* ... */ }
  }
)
```

---

## Notas de Mantenimiento

> ⚠️ **Importante**: Este documento debe mantenerse sincronizado con el archivo `frontend/app/composables/usePiniaQuery.ts`. Si se agregan nuevos métodos o se modifican las interfaces, actualice esta documentación.

### Dependencias

- `@pinia/colada`: ^1.0.x
- `vue`: ^3.5.x (del ecosistema Nuxt)

### Recursos Adicionales

- [Documentación oficial de Pinia Colada](https://pinia-colada.esm.dev/)
- [Patrones de React Query](https://tanstack.com/query/latest/docs/framework/vue/overview)
