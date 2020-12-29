# Segment
`components/UI/Segment/index.js`

### Props

| Props Name | type | Description | Default |
|---|:---:|:---:|---|
| `title` | `String` | Segment 제목 | - |
| `relaxed` | `Boolean` | margin: 30px 0; 설정  | - |
| `noMargin` | `Boolean` | margin : 0 설정 | - |
| `noPadding` | `Boolean` | padding : 0 설정 | - |
| `loading` | `Boolean` | 데이터 로딩 여부 | - |

### 예시

```html
<dn-ui-segment no-padding>
    <div style="padding: 24px 30px">
        <header style="margin-bottom: 22px">
            <h4>위 선택 문장이 잘못되었을 경우 수정해주세요</h4>
        </header>
        <dn-ui-input placeholder="취재기자 연결해 태풍 상황과 전망 알아보죠" />
    </div>
</dn-ui-segment>
```