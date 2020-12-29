# Input 
`components/UI/Input/index.js`

### Props

| Props Name | type | Description | Default |
|---|:---:|:---:|---|
| `value` | `String, Number` | input value | - |
| `type` | `'email', 'hidden', 'number', 'password', 'search', 'tel', 'text', 'url'` | input 타입 | 'text' |
| `name` | `String` | input 이름 | - |
| `id` | `String` | input 아이디 | - |
| `placeholder` | `String` | input placeholder | - |
| `tabindex` | `String, Number` | 포커스 이동순서 지정 | 0 |
| `autocomplete` | `String, Boolean` | input 자동완성 여부 | - |
| `loading` | `Boolean` | 데이터 로딩 여부 | - |
| `disabled` | `Boolean` | input 비활성화 지정 | - |
| `error` | `Boolean` | input formcheck error 인 경우  | - |
| `success` | `Boolean` | input formcheck success 인 경우 | - |
| `fluid` | `Boolean` | 부모 컨테이너에 맞게 width 설정 | true |
| `label` | `String` | input 라벨 | - |

### 예제 

`type`이 `text` 인 경우,

```html
<dn-ui-input placeholder="취재기자 연결해 태풍 상황과 전망 알아보죠" />
```
---

`type`이 `email` 인 경우,

```html
<dn-ui-input type="email" placeholder="example@deepnatural.ai" />
```
---

`type`이 `hidden` 인 경우,

```html
<dn-ui-input type="hidden" value="hiddenValue" />
```
---

`type`이 `number` 인 경우,

```html
<dn-ui-input type="number" />
```
---

`type`이 `password` 인 경우,

```html
<dn-ui-input type="password" v-model={password} />
```
---