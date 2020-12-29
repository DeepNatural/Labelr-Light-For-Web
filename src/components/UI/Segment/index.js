import { isValid } from '@/utils/isValid'
import { merge } from '@/utils/merge'

class SegmemtProps {
  /**
   * @typedef TypeSegmentProps
   * @prop {string} title
   * @prop {boolean} relaxed
   * @prop {boolean} noPadding
   * @prop {boolean} noMargin
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeSegmentProps>}
     */
    const props = {
      title: String,
      relaxed: Boolean,
      noMargin: Boolean,
      noPadding: Boolean,
      loading: Boolean
    }

    return props
  }
}

const hasTitle = title => isValid.string(title) || isValid.object(title)

/**
 * @type {import('vue/types/umd').Component}
 */
const Segment = {
  name: 'DNSegment',

  functional: true,

  props: SegmemtProps.toScheme(),

  /**
   * @param {import('vue/types/umd').CreateElement} h
   * @param {import('vue/types/umd').RenderContext<TypeSegmentProps>}
   */
  render(
    h, {
      props: { title, relaxed, noMargin, noPadding, loading },
      scopedSlots,
      data
    }
  ) {
    const _title = isValid.function(scopedSlots.title) ? scopedSlots.title() : title
    const classList = [ 'ui', 'segment', 'attached' ]

    if(loading) classList.push('loading')

    return (
      <div
        class={{
          'dn-segment': true,
          relaxed,
          'no-margin': noMargin,
          'no-padding': noPadding,
          ...merge(data.class, data.staticClass)
        }}
        style={{
          ...merge(data.style, data.staticStyle)
        }}>
        {hasTitle(_title) ? renderTitle(h, _title) : null}
        
        <div class={classList}>
          {scopedSlots.default && scopedSlots.default()}
        </div>
      </div>
    )
  }
}

const renderTitle = (h, title) => (
  <header class="ui header top attached">
    {title}
  </header>
)

export default Segment
