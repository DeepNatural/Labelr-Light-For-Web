import _ from 'lodash'
import { BaseAnnotationToolProps } from '@/utils/annotationTool'
import { renderDescriptionsAndInstructionDetail as renderHowTo } from '@/utils/slots'
import { AnnotationToolMixin } from '@/mixin/annotationTool'
import './style.scss'

/**
 * @type {import('vue/types/umd').ComponentOptions}
 */
const DNMain = {
  name: 'DNMain',

  mixins: [AnnotationToolMixin],

  data: () => ({
    toolInfos: [
      {
        name: 'Polygon',
        description: 'Image Polyline Tool',
        link: '/polygon',
      },
      {
        name: 'Image Annotation',
        description: 'Bounding Box & Polyline Tool',
        link: '/image-annotation',
      },
    ],
  }),

  props: BaseAnnotationToolProps.toScheme(),

  computed: {},

  created() {
    this._setSkip({ use: false })
  },

  render(h) {
    return (
      <dn-annotation-layout-type-a
        id="dn-annotation-main"
        noRightPanel
        headerTitle="Labelr Light"
      >
        {...renderHowTo(h, this.$slots.default)}
        <template slot="main">
          <dn-ui-segment style={{ height: '100%' }} no-padding>
            <div class="tool-card-container">
              {this.toolInfos.map(toolInfo => (
                <div class="tool-card">
                  <div class="tool-card-header">{toolInfo.name}</div>
                  <div class="tool-card-content">{toolInfo.description}</div>
                  <div class="tool-card-action">
                    <a href={toolInfo.link}>
                      <dn-ui-button color="primary">확인</dn-ui-button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </dn-ui-segment>
        </template>
      </dn-annotation-layout-type-a>
    )
  },
}

export default DNMain
