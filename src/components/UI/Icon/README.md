# Icon

`components/UI/Icon/index.jsx`

### Props

| Props Name         |                     type                      |        Description        | Default   |
| ------------------ | :-------------------------------------------: | :-----------------------: | --------- |
| `type`             | `'assetIcon', 'simple-line-icons','material'` |        아이콘 타입        | assetIcon |
| `name`(_required_) |                   `string`                    |        아이콘 이름        | -         |
| `size`             |                `number,string`                |        아이콘 크기        | 24        |
| `theme`            |                   `string`                    | 특정 모드 아이콘만 보이기 | undefined |

### 예제

`type` 이 `assetIcon` 일 경우,

```html
<dn-ui-icon name="attach" />
```

> `type` 이 `assetIcon` 일 경우에는 `icons` 디렉토리의 `svg` 파일을 사용합니다.

---

`type` 이 `simple-line-icons` 일 경우,

```html
<dn-ui-icon type="simple-line-icons" name="login" />
```

---

`type` 이 `material` 일 경우,

```html
<dn-ui-icon type="material" name="all_out" />
```

---

day 모드 아이콘만 보이고 싶은 경우

```html
<dn-ui-icon theme="day" name="all_out" />
```

night 모드 아이콘만 보이고 싶은 경우

```html
<dn-ui-icon theme="night" name="all_out" />
```
