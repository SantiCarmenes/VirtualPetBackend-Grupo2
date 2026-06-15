import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ORDER_SERVICE } from '../../order/interfaces/order-service.interface';
import type { IOrderService } from '../../order/interfaces/order-service.interface';
import type { InternalToolCall } from '../llm/llm-client.interface';

const COMPANY_INFO = {
  horarios_de_entrega:     'Lunes a sábado de 9:00 a 18:00 hs. Sin servicio domingos ni feriados nacionales.',
  intentos_de_entrega:     'Realizamos hasta 3 intentos de entrega. Tras 3 intentos fallidos el pedido se cancela automáticamente.',
  costos_de_envio:         'El costo varía según el método de envío y la zona seleccionados al momento de la compra.',
  facturacion:             'Podés solicitar factura por este chat para pedidos entregados dentro del mismo mes de entrega. Necesitás tu CUIT de 11 dígitos.',
  devolucion:              'Escribinos a soporte indicando número de pedido y motivo. Procesamos la devolución en hasta 5 días hábiles.',
  contacto:                'soporte@virtualpet.com | 0800-333-7387 (PETS) | Lunes a viernes 9:00-17:00 hs',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  RECEIVED:       'Pedido recibido',
  IN_PREPARATION: 'En preparación',
  IN_TRANSIT:     'En camino',
  DELIVERED:      'Entregado',
  NOT_DELIVERED:  'Entrega fallida',
  CANCELLED:      'Cancelado',
};

@Injectable()
export class ToolExecutor {
  constructor(
    @Inject(ORDER_SERVICE) private readonly orderService: IOrderService,
  ) {}

  async execute(toolCall: InternalToolCall, userId: string): Promise<string> {
    switch (toolCall.name) {
      case 'consultar_informacion_empresa':
        return JSON.stringify(COMPANY_INFO);

      case 'consultar_mis_pedidos':
        return this.consultarMisPedidos(userId);

      case 'consultar_pedido':
        return this.consultarPedido(toolCall.input as { orderId: string }, userId);

      case 'solicitar_facturacion':
        return this.solicitarFacturacion(
          toolCall.input as { orderId: string; cuit: string },
          userId,
        );

      default:
        return JSON.stringify({ error: `Tool desconocida: ${toolCall.name}` });
    }
  }

  private async consultarMisPedidos(userId: string): Promise<string> {
    try {
      const result = await this.orderService.findMyOrdersPaginated(userId, 1, 5);
      const orders = result.data.map(o => ({
        id:        o.id,
        estado:    ORDER_STATUS_LABEL[o.status] ?? o.status,
        total:     `$${Number(o.total).toLocaleString('es-AR')} ARS`,
        fecha:     new Date(o.createdAt).toLocaleDateString('es-AR'),
        articulos: (o as any).items?.length ?? 0,
      }));
      return JSON.stringify({ pedidos: orders, total: result.pagination.total });
    } catch {
      return JSON.stringify({ error: 'No se pudieron obtener los pedidos' });
    }
  }

  private async consultarPedido(
    input: { orderId: string },
    userId: string,
  ): Promise<string> {
    try {
      const order = await this.orderService.findOrderById(input.orderId);
      if ((order as any).userId !== userId) {
        return JSON.stringify({ error: 'No tenés acceso a ese pedido' });
      }
      return JSON.stringify({
        id:              order.id,
        estado:          ORDER_STATUS_LABEL[order.status] ?? order.status,
        total:           `$${Number(order.total).toLocaleString('es-AR')} ARS`,
        fecha:           new Date(order.createdAt).toLocaleDateString('es-AR'),
        articulos:       (order as any).items?.length ?? 0,
        requiereFactura: (order as any).requiresInvoice ?? false,
        cuitFactura:     (order as any).invoiceCuit ?? null,
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        return JSON.stringify({ error: 'Pedido no encontrado' });
      }
      return JSON.stringify({ error: 'No se pudo obtener el pedido' });
    }
  }

  private async solicitarFacturacion(
    input: { orderId: string; cuit: string },
    userId: string,
  ): Promise<string> {
    try {
      await this.orderService.requestInvoice(input.orderId, input.cuit, userId);
      return JSON.stringify({
        ok:      true,
        mensaje: `Facturación registrada. Tu pedido ${input.orderId.substring(0, 8).toUpperCase()} será facturado al CUIT ${input.cuit}. El equipo de backoffice se encargará del proceso.`,
      });
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        return JSON.stringify({ ok: false, error: (err as Error).message });
      }
      return JSON.stringify({ ok: false, error: 'No se pudo registrar la solicitud de facturación' });
    }
  }
}
