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
