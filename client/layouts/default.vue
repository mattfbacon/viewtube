<script setup lang="ts">
import MainHeader from '@/components/header/MainHeader.vue';
import MessageBoxContainer from '@/components/message/MessageBoxContainer.vue';
import ThemeStyling from '@/components/themes/ThemeStyling.vue';
import { useSettingsStore } from '@/store/settings';

const route = useRoute();
const settingsStore = useSettingsStore();

const hydrated = ref(false);

onMounted(() => {
  hydrated.value = true;
});

useHead({
  titleTemplate: titleChunk => {
    if (!titleChunk) {
      return 'ViewTube';
    }
    if (titleChunk.includes('ViewTube ::')) {
      return titleChunk;
    }
    return `${titleChunk} :: ViewTube`;
  }
});

const appRef = ref(null);

const headless = computed((): boolean => {
  return Boolean(route.meta.headless);
});

const getThemeClass = (): string => {
  if ((process as any).browser) {
    return `theme--${settingsStore.theme}`;
  } else {
    return 'theme--default';
  }
};

if (appRef.value) {
  appRef.value.classList.add(getThemeClass());
}
</script>

<template>
  <div id="app" ref="appRef" class="layout" :hydrated="hydrated">
    <ThemeStyling />
    <MainHeader v-if="!headless" class="main-header" />
    <slot />
    <MessageBoxContainer />
  </div>
</template>

<style lang="scss">
.blur-enter-active,
.blur-leave-active {
  transition: all 0.4s;
}
.blur-enter-from,
.blur-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

vite-error-overlay {
  z-index: 10000;
}
#app {
  font-family: 'noto-sans', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--title-color);
  background-color: var(--bgcolor-main);

  .progress-bar-margin {
    top: $header-height - 3px !important;
  }

  .content {
    width: 100%;
    box-sizing: border-box;
  }
}
* {
  scrollbar-color: var(--theme-color) transparent;
  scrollbar-width: thin;
  touch-action: manipulation;

  &:focus-visible {
    outline: none;
  }

  &::selection {
    background: var(--theme-color);
    color: var(--title-color);
  }

  &::-moz-selection {
    background: var(--theme-color);
  }

  &::-webkit-scrollbar {
    height: 6px;
    width: 6px;
    background: var(--bgcolor-main);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--theme-color);
    border-radius: 0;
    -webkit-border-radius: 0;
  }

  &::-webkit-scrollbar-corner {
    background: var(--bgcolor-main);
  }
}

.ripple * {
  pointer-events: none !important;
}
body.transition-all * {
  transition:
    background-color 300ms ease,
    color 300ms ease,
    opacity 300ms ease;
}
p,
h1,
h2,
h3,
h4,
h5,
h6,
a {
  margin: 0;
}
div.links,
pre.links,
span.links {
  a {
    text-decoration: none;
    color: var(--theme-color-alt);
    position: relative;
    transition:
      background-size 300ms $dynamic-easing,
      color 300ms $intro-easing;
    background-image: $theme-color-primary-gradient;
    background-size: 0% 2px;
    background-position: 0 100%;
    background-repeat: no-repeat;

    &:hover {
      color: var(--theme-color);
      background-size: 100% 2px;
    }
  }
}
html,
body,
#__layout,
#__nuxt {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: var(--bgcolor-main);
  color: var(--title-color);
}
div,
p {
  font-family: noto-sans, Arial, sans-serif;
}

.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

a,
button,
.selectable {
  position: relative;
  &::after {
    box-shadow: 0 0 0 2px transparent;
    transition: box-shadow 100ms linear;
    content: '';
    position: absolute;
    left: 2px;
    top: 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    pointer-events: none;
    user-select: none;
    z-index: +1;
    border-radius: inherit;
  }

  &:focus {
    &::after {
      box-shadow: 0 0 0 2px var(--theme-color);
    }
    outline: none;
  }
}

input:focus {
  outline: solid 2px var(--theme-color);
}

textarea:focus {
  outline: none;
}

a {
  text-decoration: none;
  color: unset;
}
.monospace {
  display: inline-block;
  background-color: #0000004d;
  padding: 2px 5px;
  font-family: monospace;
  border-radius: 4px;
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  background-clip: text;
  color: var(--title-color);
  -webkit-text-fill-color: var(--title-color);
}
</style>
