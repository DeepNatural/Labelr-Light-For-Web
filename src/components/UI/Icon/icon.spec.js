import { shallowMount } from '@vue/test-utils'
import DNUIIcon from './index.jsx'

describe('dn-ui-icon', () => {
  it('아이콘 파일 세트(Day/Night)가 존재하는지 확인', () => {
    const wrapper = shallowMount(DNUIIcon, {
      propsData: {
        name: 'attach'
      }
    })

    expect(wrapper.element.querySelector('img.day').getAttribute('src').indexOf('attach') >= 0).toEqual(true)
    expect(wrapper.element.querySelector('img.night').getAttribute('src').indexOf('attach-w') >= 0).toEqual(true)

    wrapper.destroy()
  })
})
