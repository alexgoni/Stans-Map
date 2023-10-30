#### Measurement

1. label

- [x] line label
- [x] area label

2. strict polygon

- [x] viewer에 add

      현재 우클릭 시 분할된 좌표값을 받아 각각의 entity를 추가하는 것은 가능

      예상면적: 하나의 entity의 position 좌표를 변환시키는 것이 아니라
      여러개의 entity를 추가하는 방식이기 때문에 기존 방법으로는 불가
      -> polyline으로 변경

- [x] 동적으로 그려지는 부분 선으로 대체
- [x] 중복되는 부분 지우기

        hole의 조건

        - inner polygon이 outer polygon에 포함될때
        - 가장 outer부터 inner 순으로 [4, hole:3], [2, hole:1] polygon add

        turf unkinked polygon의 unkinkPolygon.feature 배열 => outer부터 inner 순서
        turf.booleanContain으로 포함관계일시 polygon hiererachy의 hole로 viewer에 add

- [x] 각각의 polygon의 넓이를 더한 것과 turf.area로 전체 한번에 계산한 것 비교 : turf에서 kinked polygon에 대한 넓이 계산 찾아보기

3. drag 기능 : ❌

4. toolbox 예외케이스

- [x] state에 따라 widget 바꾸기
- [x] 하나의 widget이 on 되면 다른 widget은 off

        drawer가 진행중일때 drawer widnget off 하는 경우 : 우클릭이나 두번째 클릭을 하지 않았을 때는 group에 푸시되지 않아서 지울 수가 없음 (이게 올바른 동작?) => line, area는 우클릭으로 종료 이벤트 실행, circle은 프로퍼티 초기화하고 viewer에서 entity 지우는 forceReset 메서드 호출
