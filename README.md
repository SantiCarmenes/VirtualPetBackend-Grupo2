# VirtualPet Backend — Grupo 2

Backend de la aplicación VirtualPet. Construido con **NestJS** y **Prisma ORM** sobre **PostgreSQL**.

---

## Arquitectura general

El sistema sigue el patrón de **monolito modular**: una única aplicación deployable organizada en módulos independientes con límites de dominio bien definidos. Cada módulo es responsable de su propia lógica, capas de acceso a datos e interfaces HTTP, sin acoplarse directamente a los internos de otros módulos.

Los módulos se comunican a través de inyección de dependencias de NestJS (importando módulos entre sí cuando es necesario), sin llamadas HTTP entre ellos ni colas de mensajes.

---

## Módulos

### auth
Maneja autenticación y autorización. Implementa estrategias JWT (access token + refresh token) y reset de contraseña por mail.

Capas: `decorators` · `dto` · `guards` · `interfaces` · `strategies`

Arquitectura: **capas estándar** (NestJS convencional — controller → service → repositorio vía Prisma).

---

### user
Gestión del perfil de usuario.

Capas: `dto` · `interfaces`

Arquitectura: **capas estándar**.

---

### catalog
Catálogo de productos (mascotas virtuales, items, etc.).

Capas: `controllers` · `dto` · `interfaces` · `services`

Arquitectura: **capas estándar**.

---

### inventory
Gestión del inventario de usuarios.

Capas: `controllers` · `dto` · `interfaces` · `services`

Arquitectura: **capas estándar**.

---

### order
Gestión de órdenes de compra.

Capas: `controllers` · `dto` · `interfaces` · `services`

Arquitectura: **capas estándar**.

---

### mail
Servicio transversal de envío de emails (confirmación, reset de contraseña, etc.). No expone endpoints propios.

Arquitectura: **servicio auxiliar** (sin capas propias, consumido por otros módulos).

---

### payment
Procesamiento de pagos.

Arquitectura: **hexagonal (ports & adapters)**.

```
payment/
├── domain/               # Entidades y lógica de negocio pura (sin dependencias externas)
├── application/
│   └── ports/
│       ├── inbound/      # Interfaces que definen los casos de uso (driven by the app)
│       └── outbound/     # Interfaces que el dominio necesita del exterior (repositorios, APIs)
├── infrastructure/
│   ├── http/             # Adaptador de entrada: controllers REST
│   └── persistence/      # Adaptador de salida: implementación Prisma de los puertos outbound
└── dto/                  # Objetos de transferencia de datos (request/response)
```

El dominio no conoce ni Prisma ni NestJS. Las dependencias apuntan siempre hacia adentro: `infrastructure → application → domain`.

---

### shipping
Gestión de envíos y seguimiento de pedidos.

Arquitectura: **hexagonal (ports & adapters)** — misma estructura que `payment`.

```
shipping/
├── domain/
├── application/
│   └── ports/
│       ├── inbound/
│       └── outbound/
├── infrastructure/
│   ├── http/
│   └── persistence/
└── dto/
```

---

### common
Utilidades y código transversal compartido entre módulos.

Contiene: `interceptors`

---

## Base de datos

Prisma ORM con PostgreSQL. El schema y las migraciones se encuentran en `src/prisma/`. Las migraciones siguen el ciclo de vida del proyecto y están versionadas.
