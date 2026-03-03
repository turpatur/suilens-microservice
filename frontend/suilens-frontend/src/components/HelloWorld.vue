<template>
  <!-- give container a surface color so it's not completely black in dark theme -->
  <v-container class="py-8" color="surface" max-width="900">
    <!-- ensure heading contrasts in both light and dark modes -->
    <h1 class="text-3xl mb-6 text-black dark:text-white">Catalog</h1>
    <v-list>
      <v-list-item
        v-for="lens in lenses"
        :key="lens.id"
        class="justify-space-between"
      >
        <div>
          <strong>{{ lens.modelName }}</strong> — Rp{{ lens.dayPrice }} / day
        </div>
        <v-btn size="small" @click="addToCart(lens)">add</v-btn>
      </v-list-item>
      <v-list-item v-if="isLoading">Loading...</v-list-item>
      <v-list-item v-if="error">Error fetching lenses</v-list-item>
    </v-list>

    <v-divider class="my-8" />

    <div v-if="cart.item">
      <h2 class="text-2xl mb-4">Cart</h2>
      <div>
        {{ cart.item.lensName }} — {{ cart.totalDays }} days — Rp{{ cart.totalPrice }}
      </div>
      <v-btn text color="error" @click="cart.clearCart()">clear</v-btn>

      <v-form @submit.prevent="onSubmit" class="mt-4" ref="formRef" v-model="formValid">
        <v-text-field v-model="name" label="Name" required :rules="[v => !!v || 'Name is required']" />
        <v-text-field v-model="email" label="Email" type="email" required :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Invalid email']" />
        <v-btn :disabled="create.isLoading || !formValid" type="submit">Submit Order</v-btn>
      </v-form>

      <div v-if="result.type === 'error'" class="text-red-600 mt-2">
        {{ result.message }}
      </div>
      <div v-if="result.type === 'success'" class="text-green-600 mt-2">
        {{ result.message }}
      </div>
    </div>
    <div v-else>
      <h2 class="text-2xl">Cart is empty</h2>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLenses } from '@/composables/useLenses';
import { useCreateOrder } from '@/composables/useOrders';
import { useCartStore } from '@/stores/cart';

const { data: lenses, isLoading, error } = useLenses();
const create = useCreateOrder();
const cart = useCartStore();

const name = ref('');
const email = ref('');
const formRef = ref();
const formValid = ref(false);
const result = ref<{ type: 'success' | 'error' | null; message: string | null }>({ type: null, message: null });

function addToCart(lens: any) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 3);  // default 3-day rental
  cart.setItem({
    lensId: lens.id,
    lensName: lens.modelName,
    dayPrice: parseInt(lens.dayPrice, 10),
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  });
  // reset form when adding new item to cart
  name.value = '';
  email.value = '';
  result.value = { type: null, message: null };
}

function onSubmit() {
  if (!cart.item) return;
  // clear previous result and submit
  result.value = { type: null, message: null };
  create.mutate(
    {
      customerName: name.value,
      customerEmail: email.value,
      lensId: cart.item.lensId,
      startDate: cart.item.startDate,
      endDate: cart.item.endDate,
    },
    {
      onSuccess: () => {
        result.value = { type: 'success', message: 'Order created!' };
        // clear cart and form after a short delay so user sees confirmation
        setTimeout(() => {
          name.value = '';
          email.value = '';
          cart.clearCart();
        }, 1200);
        // auto-hide success after a bit longer
        setTimeout(() => {
          result.value = { type: null, message: null };
        }, 4000);
      },
      onError: (err: any) => {
        const message = err?.message || (err?.response?.error ?? 'Failed to submit');
        result.value = { type: 'error', message };
        // keep error visible a bit longer
        setTimeout(() => {
          result.value = { type: null, message: null };
        }, 6000);
      },
    }
  );
}
</script>

<style>
@reference "../styles/tailwind.css";

.v-card {
  @apply rounded-xl;
}

.hero-card {
  @apply md:col-span-2 md:py-4 sm:pr-[120px] w-full bg-primary-100 dark:bg-primary-900
}

.v-card-subtitle {
  @apply text-wrap line-clamp-2 leading-[1.2];
  --v-medium-emphasis-opacity: .8;
}

.feature-card {
  @apply flex items-center [&>.v-card-item]:w-full bg-secondary-100;
  @apply dark:bg-linear-to-r dark:from-secondary-800 dark:to-secondary-600 dark:text-white;

  .v-card-item {
    @apply self-stretch;
  }
  .v-card-item__content {
    @apply self-stretch py-2;
  }
}
</style>
