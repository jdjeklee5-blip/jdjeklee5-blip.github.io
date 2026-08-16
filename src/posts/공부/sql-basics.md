---
title: SELECT 문의 순서와 자주 쓰는 함수들
date: 2026-08-16
tags: [sql, mysql, data]
summary: 절을 쓰는 순서와 실행되는 순서는 다르다 — COUNT·CONCAT·ROUND·IFNULL까지
cover: ./images/cover-sql-basics.svg
order: 2
---

MySQL 기준으로 정리한다. `IFNULL`, 두 인자 `CONCAT` 같은 건 DBMS마다 이름이 달라서, 갈리는 부분은 그때그때 표시해뒀다.

## 절을 쓰는 순서

상황에 따라 빠지는 절이 있지만 쓰는 순서 자체는 고정이다. 이 순서를 어기면 문법 오류가 난다.

| 순서 | 절 | 하는 일 |
| :--: | :--- | :--- |
| 1 | `SELECT` | 무엇을 꺼낼지 |
| 2 | `FROM` | 어디서 |
| 3 | `WHERE` | **행** 단위로 거르기 |
| 4 | `GROUP BY` | 묶기 |
| 5 | `HAVING` | **묶은 결과**를 거르기 |
| 6 | `ORDER BY` | 정렬 |
| 7 | `LIMIT` | 잘라내기 |

```sql
SELECT   category, COUNT(*) AS cnt
FROM     products
WHERE    price >= 1000
GROUP BY category
HAVING   COUNT(*) >= 3
ORDER BY cnt DESC
LIMIT    10;
```

### 그런데 실행되는 순서는 다르다

이게 처음에 제일 헷갈리는 지점이다. **쓰는 순서와 DB가 처리하는 순서가 같지 않다.**

```mermaid
flowchart LR
    F[FROM] --> W[WHERE] --> G[GROUP BY] --> H[HAVING] --> S[SELECT] --> O[ORDER BY] --> L[LIMIT]
```

`SELECT`는 맨 앞에 쓰지만 실제로는 뒤에서 다섯 번째에 처리된다. 여기서 실무에서 바로 부딪히는 규칙 두 개가 나온다.

| | `SELECT`에서 만든 별칭을 쓸 수 있나 | 왜 |
| :--- | :--- | :--- |
| `WHERE` | **불가** | `SELECT`보다 **먼저** 실행돼서 별칭이 아직 없다 |
| `HAVING` | MySQL 가능 / PostgreSQL 불가 | 표준상으론 `SELECT` 이전이라 원칙적으론 불가. MySQL이 확장으로 허용 |
| `ORDER BY` | **가능** | `SELECT` **다음**에 실행돼서 별칭이 이미 있다 |

```sql
-- 오류: WHERE 에서는 별칭을 못 쓴다
SELECT price * 2 AS double_price FROM products WHERE double_price > 100;

-- 정상: ORDER BY 에서는 쓸 수 있다
SELECT price * 2 AS double_price FROM products ORDER BY double_price DESC;
```

`WHERE`와 `HAVING`이 갈리는 것도 같은 이유다. `WHERE`는 묶기 **전**의 개별 행을, `HAVING`은 묶은 **후**의 그룹을 거른다. 그래서 `WHERE`에는 집계함수를 쓸 수 없다.

## ORDER BY

```sql
ORDER BY 칼럼명 ASC, 두번째칼럼 DESC
```

- `ASC` 오름차순, `DESC` 내림차순
- **아무것도 안 쓰면 `ASC`** 가 기본이다
- 방향은 칼럼마다 따로 붙는다 — `ORDER BY a, b DESC` 는 a만 오름차순, b는 내림차순이다. 둘 다 내림차순으로 하려면 `ORDER BY a DESC, b DESC`

앞 칼럼이 같을 때만 뒤 칼럼이 쓰인다. 1차 정렬에서 승부가 나면 2차 조건은 보지 않는다.

### NULL이 어디로 가는지는 DBMS마다 다르다

정렬할 때 NULL의 위치는 표준이 정해두지 않았다.

| DBMS | `ORDER BY col ASC` 에서 NULL 위치 |
| :--- | :--- |
| MySQL | 맨 **앞** (NULL을 가장 작은 값으로 취급) |
| PostgreSQL · Oracle | 맨 **뒤** |

PostgreSQL·Oracle에서는 `NULLS FIRST` / `NULLS LAST`로 직접 지정할 수 있다. MySQL에는 그 문법이 없어서 `ORDER BY (col IS NULL), col` 처럼 우회한다.

## 별칭 — AS

```sql
SELECT COUNT(id) AS 새로운_칼럼명 FROM users;
```

`AS`는 생략해도 되지만(`COUNT(id) cnt`) 붙이는 쪽이 읽기 좋다. 별칭에 공백이나 예약어를 쓰려면 백틱으로 감싼다 — `` AS `총 개수` ``.

## COUNT 세 가지

여기가 진짜 함정이다. 셋이 세는 대상이 다르다.

| 형태 | 무엇을 세나 | NULL |
| :--- | :--- | :--- |
| `COUNT(*)` | **행의 개수** | 포함 |
| `COUNT(칼럼명)` | 그 칼럼의 값 개수 | **제외** |
| `COUNT(DISTINCT 칼럼명)` | 그 칼럼의 **서로 다른** 값 개수 | **제외** |

예를 들어 이런 테이블이 있다고 하자.

| id | name | grade |
| --: | :--- | --: |
| 1 | A | 90 |
| 2 | B | *NULL* |
| 3 | C | 90 |
| 4 | D | 80 |

| 쿼리 | 결과 | 이유 |
| :--- | --: | :--- |
| `COUNT(*)` | 4 | 행이 4개 |
| `COUNT(grade)` | 3 | B의 NULL은 안 셈 |
| `COUNT(DISTINCT grade)` | 2 | 90, 80 두 종류 |

**"몇 건인가"를 묻는데 `COUNT(칼럼명)`을 쓰면 NULL만큼 적게 나온다.** 행 수를 세고 싶으면 `COUNT(*)`가 맞다.

## 집계함수와 GROUP BY

`COUNT` 말고도 같이 다니는 것들이 있다.

| 함수 | 하는 일 | NULL |
| :--- | :--- | :--- |
| `COUNT()` | 개수 | 위 표 참조 |
| `SUM()` | 합 | 제외 |
| `AVG()` | 평균 | **제외** |
| `MAX()` / `MIN()` | 최대 / 최소 | 제외 |

`GROUP BY` 없이 쓰면 테이블 전체가 한 덩어리로 계산되고, `GROUP BY`를 붙이면 그룹마다 하나씩 나온다.

```sql
-- 전체 평균 하나
SELECT AVG(grade) FROM students;

-- 반별 평균
SELECT class, AVG(grade) FROM students GROUP BY class;
```

## CONCAT — 문자열 붙이기

```sql
SELECT CONCAT(height, 'cm') FROM users;   -- 180  →  '180cm'
```

인자를 몇 개든 이어 붙인다. 숫자도 알아서 문자열로 바꿔준다.

**함정: 인자 중 하나라도 NULL이면 결과 전체가 NULL이 된다.**

```sql
CONCAT('키: ', NULL, 'cm')   -- 결과: NULL  ('키: cm' 아님)
```

그래서 NULL이 섞일 수 있는 칼럼이면 `IFNULL`로 먼저 막고 붙인다. 또는 NULL을 알아서 건너뛰는 `CONCAT_WS`(구분자 지정)를 쓴다.

> PostgreSQL·Oracle에서는 `||` 연산자를 쓴다 — `height || 'cm'`

## ROUND — 반올림

```sql
SELECT ROUND(칼럼명, 2) FROM ...;
```

두 번째 인자는 **남길 소수 자릿수**다. `2`를 주면 소수 둘째 자리까지 남기고 **셋째 자리에서 반올림**한다.

| 식 | 결과 |
| :--- | --: |
| `ROUND(86.6666, 2)` | 86.67 |
| `ROUND(86.6666, 1)` | 86.7 |
| `ROUND(86.6666, 0)` | 87 |
| `ROUND(86.6666)` | 87 |
| `ROUND(1234, -2)` | 1200 |

음수를 주면 정수부에서 반올림한다. 자릿수를 생략하면 `0`과 같다.

반올림 말고 **자르는** 게 필요하면 다른 함수다.

| 함수 | 하는 일 |
| :--- | :--- |
| `ROUND(x, n)` | 반올림 |
| `TRUNCATE(x, n)` | 버림 (자릿수 지정 가능) |
| `FLOOR(x)` | 내림 (정수) |
| `CEIL(x)` | 올림 (정수) |

## IFNULL — NULL 대체

```sql
SELECT IFNULL(칼럼명, 10) FROM ...;
```

값이 NULL이면 `10`으로 바꿔서 내보낸다. NULL이 아니면 원래 값 그대로다.

| DBMS | 함수 |
| :--- | :--- |
| MySQL | `IFNULL(값, 대체값)` |
| 표준 · 대부분 | `COALESCE(값1, 값2, ...)` — 앞에서부터 NULL이 아닌 첫 값 |
| Oracle | `NVL(값, 대체값)` |
| SQL Server | `ISNULL(값, 대체값)` |

`COALESCE`는 인자를 여러 개 받고 어디서나 통하니, 이식성을 생각하면 이쪽이 무난하다.

### AVG와 NULL — 여기서 값이 갈린다

집계함수가 NULL을 **제외**한다는 게 평균에서 크게 드러난다. 분모가 달라지기 때문이다.

위의 `grade` 예시(90, NULL, 90, 80)로 계산해보면,

| 식 | 계산 | 결과 |
| :--- | :--- | --: |
| `AVG(grade)` | (90+90+80) / **3** | 86.67 |
| `AVG(IFNULL(grade, 0))` | (90+0+90+80) / **4** | 65 |

같은 데이터인데 결과가 20점 넘게 차이 난다. **NULL을 "0점"으로 볼 것인지 "응시 안 함"으로 볼 것인지**를 먼저 정하고 써야 한다. 그냥 `AVG`를 쓰면 후자로 계산된다.

## 한 번에 정리

| 문법 | 하는 일 | 놓치기 쉬운 것 |
| :--- | :--- | :--- |
| `SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT` | 절의 작성 순서 | 실행 순서는 `FROM`부터 |
| `ORDER BY a ASC, b DESC` | 정렬 | 기본은 `ASC`, 방향은 칼럼마다 |
| `AS 별칭` | 이름 붙이기 | `WHERE`에서는 못 씀 |
| `COUNT(*)` | 행 수 | NULL 포함 |
| `COUNT(칼럼)` | 값 개수 | NULL 제외 |
| `COUNT(DISTINCT 칼럼)` | 값 종류 수 | NULL 제외 |
| `AVG(칼럼)` | 평균 | 분모에서 NULL 제외 |
| `CONCAT(a, b)` | 문자열 결합 | 하나라도 NULL이면 전체 NULL |
| `ROUND(x, 2)` | 소수 둘째 자리까지 | 셋째 자리에서 반올림 |
| `IFNULL(x, 10)` | NULL 대체 | 표준은 `COALESCE` |

## 다음에 볼 것

- `WHERE`와 `HAVING`을 각각 언제 쓰는지 실제 쿼리로 비교해보기
- `JOIN` 종류와 실행 계획
- 인덱스가 타는 조건 — 칼럼을 함수로 감싸면 왜 못 타는지
