<template>
  <div class="admin">
    <MetaPageHead title="Admin" description="Admin page" />
    <SectionTitle title="Logs" />
    <AdminLogFiles />
    <SectionTitle title="Blocked videos" />
    <AdminBlockedVideos />
  </div>
</template>

<style lang="scss" scoped>
.admin {
  width: 100%;
  max-width: $main-width;
  margin: $header-height auto 0 auto;
  padding: 0 15px;
  box-sizing: border-box;
}
</style>
