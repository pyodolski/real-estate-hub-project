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
# local 환경 설정
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:postgres}?sslmode=disable
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:1234}
    hikari:
      maximum-pool-size: 5
      minimum-idle: 1
      connection-timeout: 30000

flyway:
  enabled: false

