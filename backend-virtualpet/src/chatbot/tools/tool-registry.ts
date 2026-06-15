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
