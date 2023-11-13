### reactStrictMode와 useEffect

reactStrictMode가 true일 때 useEffect의 의존성 배열이 빈배열인 경우 두번 실행된다.
첫번째 실행될 때 cleanUp 함수도 호출이 되고 그 이후 다시 두번째 실행하게 된다.

### viewer.destroy와 IIFE

useEffect안에서 비동기 처리하기 위해 IIFE를 사용하였다.
하지만

```
useEffect(() => {
    let viewer;
    (async() => {
        IIFE
    })()

    return () => {
        viewer.destroy()
    }
}, [])
```

클린업 함수에 등록된 viewer는 undefined이므로 오류가 발생한다.

따라서 등록이 되어도 값을 참조할 수 있는 useRef를 사용하여 클린업 할 수 있도록 한다.

### reactStrictMode가 켜져있는 경우 비동기 처리

첫번째 실행할 때 await까지만 실행되고 바로 클린업 함수로 넘어간다.
하지만 viewer는 현재 undefined이므로 destroy되지 않는다.

두번째 실행 시 viewer가 추가되면서 두개의 container가 존재하게 된다.
이후 viewer가 destroy되더라도 하나가 남는 현상이 생긴다.
