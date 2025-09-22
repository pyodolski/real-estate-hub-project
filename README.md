## 폴더구조

- 도메인 (레이어X)

## Spring Initializr

- Project: Gradle
- Language: Java
- Spring Boot: 3.3.55
- Dependencies:
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Validation
- Lombok
- Flyway(DB 마이그레이션)

## Superbase

- pooler

## 파일 업로드/다운로드 시스템

### 기능 개요

- 소유권 신청 시 증빙 서류 업로드
- 업로드된 파일 다운로드
- 파일 형식 및 크기 검증
- 한글 파일명 지원

### 지원 파일 형식

- PDF (.pdf)
- 이미지 (JPG, PNG)
- Word 문서 (DOCX, DOC)

### 파일 크기 제한

- 개별 파일: 최대 10MB
- 전체 요청: 최대 50MB

### 저장 위치

- 개발 환경: `uploads/ownership/`
- 운영 환경: 환경변수 `FILE_UPLOAD_DIR`로 설정 가능

### API 엔드포인트

- 파일 업로드: `POST /api/ownership/apply-with-files`
- 파일 다운로드: `GET /api/ownership/documents/{documentId}/download`

## yml-local

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:aws-1-ap-northeast-2.pooler.supabase.com}:${DB_PORT:6543}/${DB_NAME:postgres}?sslmode=require&prepareThreshold=0
    username: ${DB_USER:postgres.qrncuvrmkwzwhimvppbl}
    password: ${DB_PASSWORD:1234}
    hikari:
      maximum-pool-size: 5
      minimum-idle: 1
      connection-timeout: 30000

  flyway:
    enabled: false
```
