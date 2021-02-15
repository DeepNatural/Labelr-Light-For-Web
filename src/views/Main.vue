<template>
  <div class="ui container fluid" :class="theme" style="overflow: hidden;">
    <dn-annotation-main no-skip>
      <description main>
        <header>
          <!-- 작업도구 제목 -->
        </header>
        <div>
          <div>
            <!-- 작업도구 설명 -->
          </div>
        </div>
      </description>
    </dn-annotation-main>
  </div>
</template>

<script>
import AnnotationHeader from '@/components/Layout/AnnotationHeader/index.vue'
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'Main',

  data: () => ({}),

  components: {
    AnnotationHeader,
  },

  computed: {
    theme() {
      return this.$store.state.annotationTool.theme
    },

    isNightTheme: {
      get() {
        return this.theme !== 'day'
      },

      set(isNightTheme) {
        this.setTheme({ theme: isNightTheme ? 'night' : 'day' })
      },
    },
  },

  methods: {
    ...mapMutations('annotationTool', {
      setTheme: 'SET_THEME',
    }),
  },
}
</script>

<style lang="scss">
.ui.container.fluid {
  position: relative;

  .img-file-upload {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    text-align: center;
    line-height: 1.6;
    letter-spacing: -0.1px;
    font-size: 15px;
    color: #fff;

    button {
      margin: 16px 0;
      border-radius: 3px;
      border: solid 1px #e1e1e1 !important;
      background-color: #ffffff !important;
      box-shadow: none !important;
      color: #333 !important;
    }
  }
}
</style>
