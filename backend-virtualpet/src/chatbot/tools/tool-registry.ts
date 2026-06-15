import { Injectable } from '@nestjs/common';
import type { LlmTool } from '../llm/llm-client.interface';

@Injectable()
export class ToolRegistry {
  getTools(): LlmTool[] {
    return [
      {
        name: 'consultar_informacion_empresa',
        description:
          'Devuelve información general de VirtualPet: condiciones de entrega, horarios, costos de envío, política de devoluciones, facturación y contacto.',
        input_schema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'consultar_mis_pedidos',
        description: 'Devuelve la lista de pedidos recientes del usuario autenticado con su estado.',
        input_schema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'consultar_pedido',
        description: 'Devuelve el detalle de un pedido específico del usuario (estado, artículos, fechas).',
        input_schema: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'ID del pedido a consultar',
            },
          },
          required: ['orderId'],
        },
      },
      {
        name: 'consultar_productos',
        description:
          'Busca productos disponibles en el catálogo de VirtualPet. ' +
          'Devuelve nombre, descripción y slug de los productos activos. ' +
          'Usá este tool cuando el usuario pregunte qué productos hay, busque algo específico, ' +
          'o quiera saber qué hay disponible en la tienda.',
        input_schema: {
          type: 'object',
          properties: {
            search: {
              type: 'string',
              description: 'Término de búsqueda (nombre o descripción del producto). Omitir para listar todos.',
            },
          },
        },
      },
      {
        name: 'consultar_categorias',
        description:
          'Devuelve el listado de categorías de productos disponibles en VirtualPet. ' +
          'Usá este tool cuando el usuario pregunte qué tipos de productos o categorías hay.',
        input_schema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'consultar_metodos_pago',
        description:
          'Devuelve los métodos de pago aceptados en VirtualPet (efectivo, tarjeta de crédito, débito, transferencia). ' +
          'Usá este tool cuando el usuario pregunte cómo puede pagar.',
        input_schema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'consultar_metodos_envio',
        description:
          'Devuelve los métodos de envío disponibles con nombre, descripción, precio base y días estimados de entrega. ' +
          'Usá este tool cuando el usuario pregunte sobre opciones de envío, costos o tiempos de entrega.',
        input_schema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'solicitar_facturacion',
        description:
          'Registra que un pedido debe ser facturado a un CUIT. ' +
          'Aplicable a pedidos con pago confirmado (estado RECEIVED, IN_PREPARATION, IN_TRANSIT o DELIVERED) ' +
          'creados dentro del mes en curso. No aplica a pedidos CANCELLED o NOT_DELIVERED. ' +
          'El CUIT debe tener exactamente 11 dígitos numéricos.',
        input_schema: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'ID del pedido a facturar',
            },
            cuit: {
              type: 'string',
              description: 'CUIT de la persona o empresa (exactamente 11 dígitos, sin guiones)',
            },
          },
          required: ['orderId', 'cuit'],
        },
      },
    ];
  }
}
