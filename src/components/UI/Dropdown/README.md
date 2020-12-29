# Dropdown
`components/UI/Dropdown/index.vue`

### Props

| Props Name | type | Description | Default |
|---|:---:|:---:|---|
| `items` | `Array<{ name: string, value: string | number }>` | 드롭다운 아이템  | [] |
| `search` | `Boolean` | 검색 기능 사용 | - |
| `multiple` | `Boolean` | 다중 선택 사용 | - |
| `inline` | `Boolean` | `display:inline` 으로 변환 | - |
| `loading` | `Boolean` | 로딩 인디케이터 | - |
| `error` | `Boolean` | 에러 표시 | - |
| `disabled` | `Boolean` | 비활성화 | - |
| `scrolling` | `Boolean` | 드롭다운 아이템에 스크롤바 사용 | - |
| `compact` | `Boolean` | 최소 사이즈의 드롭다운 사용 | - |
| `fluid` | `Boolean` | 최대 사이즈의 드롭다운 사용 | - |
| `name` | `String` | 드롭다운 name | - |
| `id` | `String` | 드롭다운 id | - |
| `placeholder` | `String` | 드롭다운 placeholder | - |
| `noKeyUse` | `Boolean`, `Array<string>` | 드롭다운에서 제공하는 기본 단축키 사용제한 | `false` |

### 예시

```html
<dn-ui-dropdown
  v-model="value"
  disabled
  :items="[
    { name: 'Item 1', value: '1' },
    { name: 'Item 2', value: '2' },
    { name: 'Item 3', value: '3' }
  ]"
  search
  no-use-keys
>
```

```html
<dn-ui-dropdown
  v-model="value"
  :items="[
    { name: 'Item 1', value: '1' },
    { name: 'Item 2', value: '2' },
    { name: 'Item 3', value: '3' }
  ]"
  search
  :no-use-keys="['upArrow','downArrow']"
>
```
