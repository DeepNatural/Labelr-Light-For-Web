# Labelr Light

## 미리 설치되어 있어야 하는 항목

* Node.js
* Chrome, Edge 와 같은 웹 브라우저

## 프로젝트 셋업
```
npm install
```

## Labelr Light 실행
```
npm run serve
```

## 작업도구 레이블 이름 변경 방법

* `src/views/Main.vue` 파일 열여주세요.
* `<script>` 태그에 있는 `export default` 된 _Object_ 가 있습니다. 그 안에 `data` Function 에서 반환되는 `labels` 를 수정합니다.

## 작업 결과물 얻는 방법

* 이미지를 업로드하고 레이블링을 진행합니다.
* 우측 상단에 있는 제출하기를 누르면 _json_ 파일을 다운로드 받게 됩니다.
