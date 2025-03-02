<script setup lang="ts">
import BadgeButton from '@/components/buttons/BadgeButton.vue';
import { useMessagesStore } from '@/store/messages';
import { ApiDto } from 'viewtube/shared';

const props = defineProps<{
  comment: ApiDto<'CommentDto'>;
  channelAuthorName?: string;
  channelAuthorId?: string;
}>();
const route = useRoute();
const messagesStore = useMessagesStore();
const imgProxy = useImgProxy();

const replies = ref([]);
const loadingReplies = ref(false);
const repliesLoaded = ref(false);
const repliesContinuationString = ref(null);
const repliesContinuationLoading = ref(false);

const hideReplies = () => {
  repliesLoaded.value = false;
};

const loadReplies = () => {
  loadingReplies.value = true;
  const replyToken = props.comment.replyToken;
  const videoId = route.query.v;
  getCommentReplies(videoId, replyToken)
    .then(response => {
      replies.value = response.comments;
      repliesContinuationString.value = response.continuation;
      repliesLoaded.value = true;
      loadingReplies.value = false;
    })
    .catch(error => {
      messagesStore.createMessage({
        type: 'error',
        title: 'Loading comments failed',
        message: error
      });
      loadingReplies.value = false;
    });
};
const loadMoreReplies = () => {
  repliesContinuationLoading.value = true;
  const videoId = route.query.v;
  getCommentReplies(videoId, repliesContinuationString.value)
    .then(response => {
      replies.value = replies.value.concat(response.comments);
      repliesContinuationString.value = response.continuation ?? null;
      repliesContinuationLoading.value = false;
    })
    .catch(error => {
      messagesStore.createMessage({
        type: 'error',
        title: 'Loading comments failed',
        message: error
      });
    });
};
</script>

<template>
  <div class="comment" :class="{ open: repliesLoaded }">
    <nuxt-link :to="{ path: '/channel/' + comment.authorId }" class="comment-author-image-link">
      <img
        class="comment-author-image"
        :src="imgProxy.url + comment.authorThumbnails[2].url"
        :alt="comment.author"
      />
    </nuxt-link>
    <div class="comment-container">
      <nuxt-link
        v-tippy="comment.author"
        class="comment-author"
        :to="{ path: '/channel/' + comment.authorId }"
        :class="{ owner: comment.authorId === channelAuthorId }"
      >
        <p class="comment-author-text">{{ comment.author }}</p>
      </nuxt-link>
      <div class="comment-content" v-html="comment.content" />
      <div class="comment-properties">
        <div class="published comment-property">
          <span>{{ comment.publishedText }}</span>
        </div>

        <div class="likes comment-property">
          <VTIcon name="mdi:thumb-up" />
          <span>{{ comment.likeCount?.toLocaleString('en-US') }}</span>
        </div>
        <div
          v-if="comment.creatorHeart"
          v-tippy="`❤ by ${channelAuthorName}`"
          class="creatorHeart comment-property tooltip"
        >
          <VTIcon name="mdi:heart" title="" />
        </div>
        <div v-if="comment.isEdited" class="edited comment-property">
          <VTIcon name="mdi:pencil" />
          <span class="edited-text">edited</span>
        </div>
      </div>
      <div v-if="comment.replyToken" class="comment-replies">
        <BadgeButton
          v-if="!repliesLoaded"
          class="comment-reply-count"
          :click="loadReplies"
          :loading="loadingReplies"
        >
          <VTIcon name="mdi:comment-outline" />
          <p>
            show
            {{ comment.replyCount?.toLocaleString('en-US') }}
            replies
          </p>
        </BadgeButton>
        <BadgeButton v-if="repliesLoaded" class="comment-reply-count" :click="hideReplies">
          <VTIcon name="mdi:comment-remove-outline" />
          <p>hide replies</p>
        </BadgeButton>
        <div v-if="repliesLoaded" class="comment-replies-list">
          <div class="comment-replies-list-height">
            <Comment
              v-for="subComment in replies"
              :key="subComment.commentId"
              class="subcomment"
              :comment="subComment"
            />
          </div>
          <BadgeButton
            v-if="!loadingReplies && repliesContinuationString"
            class="show-more-replies"
            :click="loadMoreReplies"
            :loading="repliesContinuationLoading"
          >
            <VTIcon name="mdi:reload" />
            <p>Show more</p>
          </BadgeButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.comment {
  width: 100%;
  margin: 0 0 20px 0;
  display: grid;
  grid-template-columns: 55px minmax(0, 1fr);
  font-family: $default-font;
  background-color: var(--bgcolor-alt);
  padding: 10px;
  box-sizing: border-box;
  border-radius: 4px;
  border: 2px solid var(--bgcolor-alt);
  transition: border 300ms $intro-easing;
  overflow: hidden;

  &.open {
    border: 2px solid var(--theme-color);
  }

  &.subcomment {
    padding: 0;
  }

  .comment-author-image-link {
    height: 55px;
    width: 55px;
    overflow: hidden;

    .comment-author-image {
      width: 55px;
    }
  }

  .comment-container {
    padding: 0 10px;

    .comment-author {
      display: flex;
      flex-direction: row;
      margin: 0;
      align-items: flex-start;
      font-weight: 700;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      .comment-author-text {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &.owner {
        color: var(--theme-color);
      }
    }

    .comment-content {
      font-size: 1rem;
      margin: 5px 0;
      overflow: hidden;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }

    .comment-properties {
      display: flex;
      flex-direction: row;
      gap: 15px;
      color: var(--subtitle-color-light);

      .comment-property {
        display: flex;
        gap: 4px;
        align-items: center;

        .vt-icon {
          height: 1.2em;
          width: 1.2em;
        }

        .edited-text {
          @media screen and (max-width: 390px) {
            font-size: 0;
          }
        }
      }
      .creatorHeart {
        margin: 0 10px;

        span {
          color: var(--theme-color);
        }
      }
    }
    .comment-replies {
      .comment-reply-count {
        margin: 10px 0 5px 0;
        gap: 4px;
      }
      .comment-replies-list {
        overflow: hidden;
      }
    }
  }
}
</style>
