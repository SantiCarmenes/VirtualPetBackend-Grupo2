import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CATEGORY_SERVICE } from '../../catalog/interfaces/category-service.interface';
import type { ICategoryService } from '../../catalog/interfaces/category-service.interface';
import { PRODUCT_SERVICE } from '../../catalog/interfaces/product-service.interface';
import type { IProductService } from '../../catalog/interfaces/product-service.interface';
import { ORDER_SERVICE } from '../../order/interfaces/order-service.interface';
import type { IOrderService } from '../../order/interfaces/order-service.interface';
import { PAYMENT_METHOD_OPTIONS } from '../../payment/domain/payment-method.enum';
import { SHIPPING_SERVICE } from '../../shipping/application/ports/inbound/shipping-service.port';
import type { IShippingService } from '../../shipping/application/ports/inbound/shipping-service.port';
import { ChatbotConfigService } from '../chatbot-config.service';
import type { InternalToolCall } from '../llm/llm-client.interface';

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
    @Inject(ORDER_SERVICE)    private readonly orderService:    IOrderService,
    @Inject(PRODUCT_SERVICE)  private readonly productService:  IProductService,
    @Inject(CATEGORY_SERVICE) private readonly categoryService: ICategoryService,
    @Inject(SHIPPING_SERVICE) private readonly shippingService: IShippingService,
    private readonly configService: ChatbotConfigService,
  ) {}

  async execute(toolCall: InternalToolCall, userId: string): Promise<string> {
    switch (toolCall.name) {
      case 'consultar_informacion_empresa':
        return JSON.stringify(await this.configService.getCompanyInfo());

      case 'consultar_mis_pedidos':
        return this.consultarMisPedidos(userId);

      case 'consultar_pedido':
        return this.consultarPedido(toolCall.input as { orderId: string }, userId);

      case 'solicitar_facturacion':
        return this.solicitarFacturacion(
          toolCall.input as { orderId: string; cuit: string },
          userId,
        );

      case 'consultar_productos':
        return this.consultarProductos(toolCall.input as { search?: string });

      case 'consultar_categorias':
        return this.consultarCategorias();

      case 'consultar_metodos_pago':
        return this.consultarMetodosPago();

      case 'consultar_metodos_envio':
        return this.consultarMetodosEnvio();

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

  private async consultarProductos(input: { search?: string }): Promise<string> {
    try {
      const result = await this.productService.findAll({
        search: input.search,
        active: true,
        limit:  12,
      }) as { data: { id: string; name: string; slug: string; description: string | null }[] };
      const productos = result.data.map(p => ({
        id:          p.id,
        nombre:      p.name,
        slug:        p.slug,
        descripcion: p.description ?? '',
      }));
      return JSON.stringify({ productos, total: productos.length });
    } catch {
      return JSON.stringify({ error: 'No se pudo obtener el catálogo de productos' });
    }
  }

  private async consultarCategorias(): Promise<string> {
    try {
      const categories = await this.categoryService.findAll() as { id: string; name: string; slug: string; children?: unknown[] }[];
      const categorias = categories.map(c => ({
        id:     c.id,
        nombre: c.name,
        slug:   c.slug,
        subcategorias: Array.isArray(c.children) ? (c.children as { name: string }[]).map(ch => ch.name) : [],
      }));
      return JSON.stringify({ categorias });
    } catch {
      return JSON.stringify({ error: 'No se pudieron obtener las categorías' });
    }
  }

  private consultarMetodosPago(): string {
    const metodos = PAYMENT_METHOD_OPTIONS.map(m => ({
      codigo:      m.code,
      nombre:      m.name,
      descripcion: m.description,
    }));
    return JSON.stringify({ metodos_de_pago: metodos });
  }

  private async consultarMetodosEnvio(): Promise<string> {
    try {
      const methods = await this.shippingService.getShippingMethods();
      const metodos = methods.map(m => ({
        id:             m.id,
        nombre:         m.name,
        descripcion:    m.description ?? '',
        precio_base:    `$${Number(m.basePrice).toLocaleString('es-AR')} ARS`,
        dias_estimados: m.estimatedDays ?? null,
        activo:         m.active,
      }));
      return JSON.stringify({ metodos_de_envio: metodos });
    } catch {
      return JSON.stringify({ error: 'No se pudieron obtener los métodos de envío' });
    }
  }
}
