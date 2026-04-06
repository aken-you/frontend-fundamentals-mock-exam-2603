# 토스 Frontend Developer 면접 과제 🔥

## Getting started

```sh
yarn start
```

## Testing

아래 명령어로 더미 데이터에 기반한 구현을 테스트할 수 있습니다.

```sh
yarn test
```

## 리팩토링

### QueryKey 관리

queryOptions 활용 ([블로그](https://tkdodo.eu/blog/the-query-options-api))

```ts
export const reservationKeys = {
  // 키 계층 구조용
  all: ['reservation'],
  lists: () => [...reservationKeys.all, 'list'],

  // 쿼리 옵션용
  list: (date: string) =>
    queryOptions({
      queryKey: [...reservationKeys.lists(), date],
      queryFn: () => getReservations(date),
      enabled: !!date,
    }),
};
```

장점

1. 응집성: 쿼리를 한 곳에 모여있어 유지보수하기 좋습니다. 특히 queryKey와 queryFn 관계는 밀접하기에, 같이 관리하면 동기화하기 편합니다.
2. 자동 타입 추론: getQueryData가 반환하는 데이터 타입이 자동추론됩니다.
3. 재사용성: useQuery, useSuspenseQuery, prefetchQuery, invalidateQueries 등 다양한 함수에서 쿼리 옵션을 재사용할 수 있습니다.
