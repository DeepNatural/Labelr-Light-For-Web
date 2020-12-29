
# Button 
`components/UI/Button/index.js`

### Props

| Props Name | type | Description | Default |
|---|:---:|:---:|---|
| `type` | `String` | 버튼 타입 | button |
| `disabled` | `Boolean` | 버튼 비활성화 여부 | - |
| `loading` | `Boolean` | 데이터 로딩 여부 | - |
| `fluid` | `Boolean` | 부모 컨테이너에 맞는 너비 설정 | - |
| `circular` | `Boolean` | 원형 버튼 | - |
| `compact` | `Boolean` | fit에 맞게 패딩을 줄여줌 | - |
| `color` | `String` | 버튼 배경색 | - |
| `size` | `String` | 버튼 사이즈 | - |
| `floated` | `String` | 버튼 좌우 정렬 | - |
| `icon` | `String` | 버튼 아이콘 | - |
| `tabindex` | `Boolean, Number ` | 버튼 포커스 이동순서 지정 | - |

### 예제 

`Icon`이 들어간 버튼일 경우,

```html
<dn-ui-button tabindex="-1"
              size="small"
              icon='arrow down'>
</dn-ui-button>
```
---

그 외 버튼일 경우, 

```html
<dn-ui-button color="dark-blue">
    저장
</dn-ui-button>
```
