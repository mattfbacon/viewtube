<script setup lang="ts">
import SectionTitle from '@/components/SectionTitle.vue';
import Pagination from '@/components/pagination/Pagination.vue';
import SmallSearchBox from '@/components/SmallSearchBox.vue';
import { useMessagesStore } from '@/store/messages';

const messagesStore = useMessagesStore();
const { apiUrl } = useApiUrl();
const route = useRoute();
const imgProxy = useImgProxy();
const router = useRouter();

const currentPage = computed(() => {
  if (route.query.page) {
    return parseInt(route.query.page.toString());
  } else {
    return 1;
  }
});
const searchTerm = ref('');
const searchTermValue = ref('');
const searchTimeout = ref(null);

const {
  data: subscriptionChannels,
  error,
  refresh
} = useGetUserSubscriptionChannels({
  limit: 30,
  currentPage,
  searchTerm: searchTermValue
});

watch(error, err => {
  messagesStore.createMessage({
    type: 'error',
    title: 'Error loading subscriptions',
    message: err?.message ?? 'Error loading subscriptions'
  });
});

const pageCount = computed(() => {
  if (subscriptionChannels.value?.channelCount) {
    return Math.ceil(subscriptionChannels.value?.channelCount / 30);
  }
  return 1;
});

const channelNameToImgString = (name: string): string => {
  let initials = '';
  name.split(' ').forEach(e => {
    initials += e.charAt(0);
  });
  return initials;
};

const unsubscribe = (channel: { authorId: any; author: any }): void => {
  vtFetch<any>(`${apiUrl.value}user/subscriptions/${channel.authorId}`, {
    method: 'DELETE',
    credentials: 'include'
  }).then(response => {
    if (!response.isSubscribed) {
      refresh();
      messagesStore.createMessage({
        type: 'error',
        title: `Unsubscribed from ${channel.author}`,
        message: 'Click to undo',
        clickAction: async () => {
          await vtFetch(`${apiUrl.value}user/subscriptions/${channel.authorId}`, {
            method: 'PUT',
            credentials: 'include'
          }).then(() => {
            refresh();
          });
        }
      });
    }
  });
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

watch(
  () => route.query,
  () => {
    refresh();
  }
);

watch(searchTerm, (newValue, oldValue): void => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    if (newValue !== null && newValue.trim() !== oldValue.trim()) {
      router.push(route.path);
      searchTermValue.value = newValue.trim();
    }
  }, 500);
});
</script>

<template>
  <div class="manage-subscriptions">
    <MetaPageHead title="Manage subscriptions" description="Manage your subscriptions" />
    <SectionTitle class="page-title" :title="'Manage subscriptions'" :line="false" />
    <SmallSearchBox v-model.lazy="searchTerm" :label="'Filter'" />
    <div v-if="subscriptionChannels" class="channels-container">
      <div
        v-for="channel in subscriptionChannels.channels"
        :key="channel.authorId"
        class="channel-entry"
      >
        <nuxt-link
          v-if="
            (!channel.authorThumbnails || channel.authorThumbnails.length == 0) &&
            !channel.authorThumbnailUrl
          "
          :to="`/channel/${channel.authorId}`"
          class="fake-thmb"
        >
          <h3>
            {{ channelNameToImgString(channel.author) }}
          </h3>
        </nuxt-link>
        <nuxt-link
          v-if="
            channel.authorThumbnailUrl ||
            (channel.authorThumbnails && channel.authorThumbnails.length > 0)
          "
          :to="`/channel/${channel.authorId}`"
          class="channel-image-container"
        >
          <img
            :src="
              imgProxy.url +
              (channel.authorThumbnailUrl
                ? `${apiUrl}${channel.authorThumbnailUrl}`
                : channel.authorThumbnails[2].url)
            "
            class="channel-image"
            alt="Channel profile image"
          />
        </nuxt-link>
        <div v-tippy="channel.author" class="channel-title">
          <nuxt-link :to="`/channel/${channel.authorId}`">{{ channel.author }}</nuxt-link>
        </div>
        <a
          v-tippy="`Unsubscribe from ${channel.author}`"
          v-ripple
          href="#"
          class="channel-unsubscribe-btn"
          @click.prevent="() => unsubscribe(channel)"
        >
          ✕
        </a>
      </div>
    </div>
    <div class="manage-pagination">
      <Pagination :current-page="currentPage" :page-count="pageCount" />
    </div>
  </div>
</template>

<style lang="scss">
.manage-subscriptions {
  margin-top: $header-height;
  overflow: hidden;
  width: 100%;

  .section-title {
    max-width: $main-width;
    margin: 0 auto;
  }

  .page-title {
    .title {
      margin: 0 0 0 15px !important;
    }
  }

  .channels-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 11;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 15px;
    box-sizing: border-box;

    .channel-entry {
      display: flex;
      flex-direction: row;
      width: calc(100% - 20px);
      justify-content: space-between;
      margin: 0;
      box-sizing: border-box;
      height: 50px;
      text-align: start;
      position: relative;
      align-items: center;

      .channel-image-container {
        width: 36px;
        height: 36px;
        box-shadow: $low-shadow;

        .channel-image {
          width: 100%;
        }
      }

      .fake-thmb {
        overflow: hidden;
        background-color: var(--theme-color);
        height: 36px;
        width: 36px;
        display: flex;
        box-shadow: $low-shadow;

        h3 {
          font-size: 1.8rem;
          white-space: normal;
          text-align: center;
          margin: auto;
        }
      }

      .channel-title {
        flex: 1;
        line-height: 36px;
        margin: 0 0 0 10px;
        font-size: 1.2rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .channel-unsubscribe-btn {
        width: 30px;
        height: 30px;
        line-height: 30px;
        border-radius: 25px;
        text-align: center;
        user-select: none;
        cursor: pointer;
      }
    }
  }

  .manage-pagination {
    display: block;
    position: relative;
    z-index: 11;
    margin: 0 0 30px 0;
  }
}
</style>
