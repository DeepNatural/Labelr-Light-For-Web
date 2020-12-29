# Checkbox 
`components/UI/Checkbox/index.vue`

### Props

| Props Name | type | Description | Default |
|---|:---:|:---:|---|
| `value` | `Boolean, String, Number, Array ` | 체크박스 value | - |
| `type` | `'check','radio' ` | checkbox/radio 타입 구분 | checkbox |
| `name` | `String` | 체크박스 이름 | - |
| `id` | `String` | 체크박스 아이디 | - |
| `val` | `Boolean, String, Number` | 체크박스 value | true |
| `label` | `String` | 체크박스 라벨 | - |
| `disabled` | `boolean` |  체크박스 활성화 여부 | - |  




### 예제 

라디오 버튼으로 사용할 경우,

```html
<dn-ui-checkbox
    v-model="gender"
    type="radio"
    label="여성"
    id="female"
    name="gender"
    val="female"
/>
```

체크박스로 사용할 경우,

```html
<dn-ui-checkbox
    value="gender"
    label="여성"
    id="female"
    name="gender"
    val="female"
/>
```
