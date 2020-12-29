import { merge } from '@/utils/merge'

class ButtonProps {
  /**
   * @typedef TypeButtonProps
   * @prop {'button' | 'submit' | 'cancel'} type
   * @prop {boolean} disabled
   * @prop {boolean} loading
   * @prop {boolean} fluid
   * @prop {boolean} circular
   * @prop {boolean} compact
   * @prop {boolean} noRound
   * @prop {boolean | { accept: string }} file
   * @prop {fileAccept} color
   * @prop {string} color
   * @prop {string} size
   * @prop {string} floated
   * @prop {string} icon
   * @prop {string | number} tabindex
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeButtonProps>}
     */
    const props = {
      type: {
        type: String,
        default: 'button'
      },
      disabled: Boolean,
      loading: Boolean,
      fluid: Boolean,
      circular: Boolean,
      compact: Boolean,
      noRound: Boolean,
      noPadding: Boolean,
      file: [Boolean, Object],
  
      color: String,
      size: String,
      floated: String,
      icon: String,
      tabindex: [ String, Number ]
    }

    return props
  }
}

/** @type {import("vue/types/umd").FunctionalComponentOptions<TypeButtonProps>} */
const DnButton = {
  name: 'DNButton',

  functional: true,

  props: ButtonProps.toScheme(),

  render(h, { data, props, scopedSlots, listeners })  {
    let element = 'button'
    let className = 'dn ui button'
    const attrs = {}
    const children = []
    let file = null

    if(props.icon) {
      children.push(h('i', { class: `icon ${props.icon}` }))
      className += ' icon'
    }

    if(props.color)  className += ` ${props.color}`
    if(props.disabled)  {
      className += ` disabled`
      attrs.disabled = true
    }
    if(props.loading)  className += ` loading`
    if(props.size)  className += ` ${props.size}`
    if(props.floated)  className += ` ${props.floated} floated`
    if(props.compact)  className += ` compact`
    if(props.fluid)  className += ` fluid`
    if(props.circular)  className += ` circular`
    if(props.noRound)  className += ` no-round`
    if(props.noPadding)  className += ` no-padding`

    if(props.tabindex) attrs.tabindex = props.tabindex
    if(props.type) attrs.type = props.type

    scopedSlots.default ? children.push(scopedSlots.default()) : null
    
    if(props.file) {
      file = h(
        'input',
        {
          attrs: {
            type: 'file',
            accept: props.file.accept
          },
          staticStyle: { display: 'none' },
          ref: '$file',
          refInFor: true,
          on: {
            input(e) {
              listeners.inputFile ? listeners.inputFile(e) : void(0)
            }
          }
        }
      )

      children.push(file)
    }

    return h(
      element,
      {
        staticClass: className,
        class: merge(data.class, data.staticClass),
        style: merge(data.style, data.staticStyle),
        attrs,
        on: {
          click(e) {
            if(!props.loading) {
              listeners.click ? listeners.click(e) : void(0)
            }

            if(props.file && file) {
              file.elm.dispatchEvent(new MouseEvent('click'))
            }
          }
        },
        ref: data.ref,
        refInFor: data.refInFor
      },
      children
    )
  }
}

export default DnButton
