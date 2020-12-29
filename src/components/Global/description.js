class DescriptionProps {
  static toScheme() {
    return {
      main: Boolean
    }
  }
}

/**
 * @type {import('vue/types/umd').Component}
 */
const Description = {
  name: 'DNDescription',

  functional: true,

  props: DescriptionProps.toScheme(),

  render(h, { props: { main }, scopedSlots }) {
    return (
      <div
        class={{
          'dn-description': true,
          small: true,
          main
        }}
        props={{ main }}
      >
        {scopedSlots.default()}
      </div>
    )
  }
}

export default Description
