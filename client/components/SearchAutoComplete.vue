<template>
  <div v-if="visible && searchValue" class="search-autocomplete">
    <div
      v-for="(value, key) in autocompleteValues"
      :key="key"
      class="search-autocomplete-entry"
      :class="{ selected: selectedValue == key }"
      :value="value"
      :number="key"
      @mousedown.prevent="onAutocompleteMouseDown"
      @keydown.stop="() => {}"
      @mouseover.prevent="onMouseOver"
    >
      {{ value }}
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: 'SearchAutocomplete',
  props: {
    searchValue: { type: String, default: null }
  },
  setup(props, { emit }) {
    const { apiUrl } = useApiUrl();

    const autocompleteValues = ref([]);
    const visible = ref(false);
    const selectedValue = ref(0);

    const onAutocompleteMouseDown = (e: { target: any }) => {
      emit('searchValueUpdate', e.target.getAttribute('value'));
      emit('autocompleteEnter');
    };
    const onMouseOver = (e: { target: any }) => {
      selectedValue.value = parseInt(e.target.getAttribute('number'));
    };

    watch(
      () => props.searchValue,
      async () => {
        const autocompleteResponse = await vtFetch<[]>(
          `${apiUrl.value}autocomplete?q=${props.searchValue}`
        );

        autocompleteValues.value = [props.searchValue].concat(autocompleteResponse);
      }
    );

    return {
      autocompleteValues,
      visible,
      selectedValue,
      onAutocompleteMouseDown,
      onMouseOver
    };
  }
});
</script>

<style lang="scss" scoped>
.clip-enter-active,
.clip-leave-active {
  transition: clip-path 200ms $intro-easing;
}
.clip-enter-to,
.clip-leave-from {
  clip-path: polygon(-50% -50%, 150% -50%, 150% 150%, -50% 150%);
}
.clip-enter-from,
.clip-leave-to {
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
}

.search-autocomplete {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  margin-top: math.div($header-height, 2);
  background-color: var(--header-bgcolor);
  display: flex;
  flex-direction: column;
  box-shadow: $medium-shadow;

  @media screen and (max-width: $mobile-width) {
    top: math.div($header-height, 2);
    position: fixed;
    width: 100%;
  }

  .search-autocomplete-entry {
    padding: 5px 0 5px 10px;
    cursor: default;
    color: var(--title-color);
    text-decoration: none;
    font-family: $default-font;

    &.selected {
      background-color: var(--bgcolor-alt-light);
    }
  }

  &.hidden {
    display: none;
  }
}
</style>
