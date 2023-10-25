#### measurement

1. label

- [x] line label
- [x] area label

2. strict polygon

- [x] viewer에 add
      현재 우클릭 시 분할된 좌표값을 받아 각각의 entity를 추가하는 것은 가능

      예상면적: 하나의 entity의 position 좌표를 변환시키는 것이 아니라
      여러개의 entity를 추가하는 방식이기 때문에 기존 방법으로는 불가
      -> 현재 상태에서는 drag하면서 연속적으로 변화하는 면적을 보여주는 것을 어려울 것으로 보임 (구글 어스 방식?)

- [] 각각의 polygon의 넓이를 더한 것과 turf.area로 전체 한번에 계산한 것 비교

3. drag 기능

- [] line drag
- [] area drag
- [] drag 시 label의 위치 업데이트

4. widget

5. toolbox 예외케이스

- [] 이벤트 겹치는 경우

6. superclass
