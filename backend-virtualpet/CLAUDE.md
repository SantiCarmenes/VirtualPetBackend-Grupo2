Contexto del Proyecto

Backend para el e-commerce VirtualPet.La tienda venderá todo tipo de productos, desde alimentos para peces, hasta cuchas de perro. El sistema está diseñado como un monolito modular con una fuerte separación de responsabilidades y persistencia aislada por esquemas de base de datos. La comunicacion entre modulos se hacea por medio de llamada de metodos entre servicios, por medio de interfaces.

Tech Stack Core

- Framework: NestJS (Node.js).
- Lenguaje: TypeScript.
- Base de Datos: PostgreSQL (aislamiento por esquemas).
- ORM: Prisma 

Principios de Trabajo 

-  Consultar antes de actuar: Antes de modificar, eliminar o refactorizar código existente, DEBES preguntar y proponer la solución.

- Análisis de Trade-offs: Para cada nueva funcionalidad o cambio arquitectónico, presenta un breve análisis de Ventajas vs. Desventajas antes de proceder.

- Modularidad Estricta: No debe haber acoplamiento circular entre módulos. La comunicación entre módulos se prefiere mediante eventos o servicios compartidos bien definidos.


Arquitectura por Módulos

El proyecto utiliza dos enfoques arquitectónicos dependiendo de la complejidad y volatilidad del dominio:

1\. Arquitectura en Capas (Layered)

Módulos: auth, user, catalog, inventory, order.

- Controller: Entrada de red, validación de DTOs y transformación de respuesta.
- Service: Lógica de negocio orquestada.
- Repository/Entity: Persistencia y acceso a datos.

2\. Arquitectura Hexagonal (Ports \& Adapters)

Módulos: payment, shipping.

- Domain: Entidades de negocio, Value Objects y excepciones de dominio. (Sin dependencias externas).

- Application (Ports): Interfaces de entrada (Use Cases) e interfaces de salida (Repository interfaces, External Service interfaces).

- Infrastructure (Adapters): Implementaciones concretas (Prisma Repositories, integración con Stripe/MercadoPago, APIs de logística).

Reglas de Base de Datos (PostgreSQL)

- Esquemas: Cada módulo debe operar en su propio esquema de PostgreSQL (ej: auth.users, catalog.products, payment.transactions).

- Migraciones: Cada cambio en el esquema debe estar respaldado por una migración clara.

- Aislamiento: No realizar Joins entre tablas de diferentes esquemas. La agregación de datos se hace a nivel de aplicación.

Estándares de Código

-  Clean Code: Nombres descriptivos, funciones pequeñas y responsabilidad única.

- Tipado: Evitar el uso de any. Definir interfaces y tipos para todo el flujo de datos.

- Validación: Uso de class-validator y class-transformer en los DTOs.

- Tratamiento de Errores: Usar filtros de excepciones globales de NestJS y excepciones personalizadas por dominio.

DER

- Las entidades deben modelarse de acuerdo a las entidades que aparecen en el archvio Diagramas-VirtualPet-DER.png, abierto a modificaciones y sugerencias