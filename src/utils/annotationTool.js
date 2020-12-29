export class BaseAnnotationToolProps {
  title = String
  
  progress = {
    type: Number,
    default: 0
  }

  storedResult = {
    type: [ Object, Array ],
    default: () => ({})
  }

  storedTags = {
    type: String
  }

  config = {
    type: Object,
    default: () => ({})
  }
  
  context = {
    type: Object,
    default: () => ({})
  }

  taskRun = {
    type: Object,
    default: () => ({})
  }

  theme = String

  widgets = {
    type: Object,
    default: () => ({})
  }

  noUseInstruction = {
    type: Boolean,
    default: false
  }

  skipMessage = {
    type: String,
    default: '레이블할 영역이 없습니다.'
  }

  noSkip = Boolean

  /**
   * @typedef TypeBaseAnnotationToolProps
   * @prop {string} title
   */
  static toScheme() {
    /**
     * @type {import('vue/types/options').PropsDefinition<TypeBaseAnnotationToolProps>}
     */
    const props = {}

    Object.entries(Object.getOwnPropertyDescriptors(new this))
      .forEach(([ name, { value } ]) => {
        props[name] = value
      })

    return props
  }
}
