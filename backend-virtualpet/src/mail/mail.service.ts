import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

const STATUS_LABELS: Record<string, string> = {
  RECEIVED:       'Recibido',
  IN_PREPARATION: 'En preparación',
  IN_TRANSIT:     'En camino',
  DELIVERED:      'Entregado',
  NOT_DELIVERED:  'No entregado',
  CANCELLED:      'Cancelado',
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  RECEIVED:       { bg: '#fef3c7', color: '#78350f' },
  IN_PREPARATION: { bg: '#e7e5e4', color: '#1c1917' },
  IN_TRANSIT:     { bg: '#dbeafe', color: '#1e40af' },
  DELIVERED:      { bg: '#d1fae5', color: '#065f46' },
  NOT_DELIVERED:  { bg: '#fef9c3', color: '#713f12' },
  CANCELLED:      { bg: '#fee2e2', color: '#991b1b' },
};

const fmt = (amount: unknown) =>
  Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 });

type OrderMailData = {
  id: string;
  customerEmail: string;
  customerName: string;
  items: { productNameSnapshot: string; quantity: number; unitPrice: unknown; lineTotal: unknown }[];
  subtotal: unknown;
  shippingCost: unknown;
  total: unknown;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      .vp-outer  { background-color:#0c0a09 !important; }
      .vp-card   { background-color:#1e1a17 !important; }
      .vp-body   { background-color:#1e1a17 !important; color:#fafaf9 !important; }
      .vp-text   { color:#fafaf9 !important; }
      .vp-muted  { color:#78716c !important; }
      .vp-th     { background-color:#292524 !important; color:#e7e5e4 !important; }
      .vp-tr-alt { background-color:#242120 !important; }
      .vp-sep    { border-color:#2c2824 !important; }
      .vp-footer { background-color:#131110 !important; border-color:#2c2824 !important; }
      .vp-ft     { color:#57534e !important; }
      a          { color:#a8a29e !important; }
    }
  </style>
</head>
<body class="vp-outer" style="margin:0;padding:0;background:#fafaf9;font-family:Arial,Helvetica,sans-serif;">
  <table class="vp-outer" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#fafaf9;padding:44px 16px;">
    <tr><td align="center">

      <table class="vp-card" width="600" cellpadding="0" cellspacing="0" border="0"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;
               overflow:hidden;box-shadow:0 8px 40px rgba(28,25,23,0.12);border:1px solid #e7e5e4;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(140deg,#1c1917 0%,#292524 60%,#0c0a09 100%);
                     padding:38px 40px 32px;text-align:center;">
            <h1 style="margin:0;color:#fafaf9;font-size:26px;font-weight:800;letter-spacing:0.4px;">
              Virtual Pet
            </h1>
            <p style="margin:7px 0 0;color:#a8a29e;font-size:11px;letter-spacing:3px;
                      text-transform:uppercase;">Tienda de Mascotas</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="vp-body" style="padding:40px;color:#1c1917;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td class="vp-footer" style="background:#f5f5f4;border-top:1px solid #e7e5e4;
                                       padding:22px 40px;text-align:center;">
            <p class="vp-ft" style="margin:0;color:#78716c;font-size:12px;line-height:1.7;">
              © 2026 Virtual Pet · Todos los derechos reservados
            </p>
            <p class="vp-ft" style="margin:5px 0 0;color:#78716c;font-size:11px;">
              Este correo fue generado automáticamente. No respondas a este mensaje.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
    <tr>
      <td style="border-radius:12px;background:#1c1917;
                 box-shadow:0 4px 14px rgba(28,25,23,0.25);">
        <a href="${href}"
          style="display:inline-block;padding:14px 34px;color:#fafaf9;font-weight:700;
                 font-size:15px;text-decoration:none;letter-spacing:0.3px;border-radius:12px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function trackLink(url: string): string {
  return `<p class="vp-muted" style="margin:16px 0 0;color:#78716c;font-size:12px;">
    O copiá este enlace en tu navegador:<br>
    <a href="${url}" style="color:#292524;word-break:break-all;">${url}</a>
  </p>`;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend = new Resend(process.env.RESEND_API_KEY);
  private readonly from   = process.env.MAIL_FROM ?? 'Virtual Pet <onboarding@resend.dev>';

  async sendOrderConfirmation(order: OrderMailData): Promise<void> {
    const trackUrl = `${process.env.FRONTEND_URL}/track/${order.id}`;
    const orderId  = order.id.slice(0, 8).toUpperCase();

    const itemRows = order.items.map((item, i) => `
      <tr class="${i % 2 === 1 ? 'vp-tr-alt' : ''}"
          style="${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
        <td class="vp-text" style="padding:12px 14px;color:#1f2937;font-size:14px;">
          ${item.productNameSnapshot}
        </td>
        <td class="vp-text" style="padding:12px 14px;color:#1f2937;font-size:14px;
                                    text-align:center;">
          ${item.quantity}
        </td>
        <td class="vp-text" style="padding:12px 14px;color:#1f2937;font-size:14px;
                                    text-align:right;white-space:nowrap;">
          $${fmt(item.unitPrice)}
        </td>
        <td class="vp-text" style="padding:12px 14px;color:#1f2937;font-size:14px;
                                    text-align:right;white-space:nowrap;font-weight:600;">
          $${fmt(item.lineTotal)}
        </td>
      </tr>`).join('');

    const content = `
      <h2 class="vp-text"
          style="margin:0 0 6px;color:#1c1917;font-size:22px;font-weight:800;">
        ¡Gracias por tu compra, ${order.customerName}!
      </h2>
      <p class="vp-muted"
         style="margin:0 0 24px;color:#78716c;font-size:14px;">
        Tu pedido fue recibido y está siendo procesado.
      </p>

      <!-- Order ID badge -->
      <div style="display:inline-block;background:#f5f5f4;border:1px solid #e7e5e4;
                  border-radius:8px;padding:8px 16px;margin-bottom:28px;">
        <span style="color:#78716c;font-size:12px;font-weight:700;letter-spacing:1px;
                     text-transform:uppercase;">N.º de pedido</span><br>
        <span style="color:#1c1917;font-size:16px;font-weight:800;letter-spacing:2px;">
          #${orderId}
        </span>
      </div>

      <!-- Items table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-collapse:collapse;border-radius:12px;overflow:hidden;
                    border:1px solid #e7e5e4;margin-bottom:20px;">
        <thead>
          <tr class="vp-th" style="background:#f5f5f4;">
            <th style="padding:12px 14px;text-align:left;font-size:12px;font-weight:700;
                       color:#78716c;text-transform:uppercase;letter-spacing:0.5px;">
              Producto
            </th>
            <th style="padding:12px 14px;text-align:center;font-size:12px;font-weight:700;
                       color:#78716c;text-transform:uppercase;letter-spacing:0.5px;">
              Cant.
            </th>
            <th style="padding:12px 14px;text-align:right;font-size:12px;font-weight:700;
                       color:#78716c;text-transform:uppercase;letter-spacing:0.5px;">
              Precio
            </th>
            <th style="padding:12px 14px;text-align:right;font-size:12px;font-weight:700;
                       color:#78716c;text-transform:uppercase;letter-spacing:0.5px;">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <table cellpadding="0" cellspacing="0" border="0"
             style="margin-left:auto;width:260px;">
        <tr>
          <td class="vp-muted" style="padding:6px 0;color:#78716c;font-size:14px;">
            Subtotal
          </td>
          <td class="vp-text" style="padding:6px 0;color:#374151;font-size:14px;
                                      text-align:right;">
            $${fmt(order.subtotal)}
          </td>
        </tr>
        <tr>
          <td class="vp-muted" style="padding:6px 0;color:#78716c;font-size:14px;">
            Envío
          </td>
          <td class="vp-text" style="padding:6px 0;color:#374151;font-size:14px;
                                      text-align:right;">
            $${fmt(order.shippingCost)}
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <div class="vp-sep" style="border-top:1px solid #e5e7eb;margin:8px 0;"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#1c1917;font-size:16px;font-weight:800;">
            Total
          </td>
          <td style="padding:4px 0;color:#292524;font-size:18px;font-weight:800;
                     text-align:right;">
            $${fmt(order.total)}
          </td>
        </tr>
      </table>

      ${btn(trackUrl, '📦 Seguir mi pedido')}
      ${trackLink(trackUrl)}`;

    try {
      await this.resend.emails.send({
        from:    this.from,
        to:      order.customerEmail,
        subject: `¡Pedido recibido! #${orderId} – Virtual Pet`,
        html:    layout(content),
      });
    } catch (err) {
      this.logger.error(`Error enviando confirmación de orden ${order.id}`, err);
    }
  }

  async sendOrderStatusUpdate(
    order: Pick<OrderMailData, 'id' | 'customerEmail' | 'customerName'>,
    newStatus: string,
  ): Promise<void> {
    const trackUrl = `${process.env.FRONTEND_URL}/track/${order.id}`;
    const orderId  = order.id.slice(0, 8).toUpperCase();
    const label    = STATUS_LABELS[newStatus] ?? newStatus;
    const badge    = STATUS_BADGE[newStatus] ?? { bg: '#f3f4f6', color: '#374151' };

    const statusIcons: Record<string, string> = {
      RECEIVED:       '🕐',
      IN_PREPARATION: '📦',
      IN_TRANSIT:     '🚚',
      DELIVERED:      '🎉',
      NOT_DELIVERED:  '⚠️',
      CANCELLED:      '❌',
    };
    const icon = statusIcons[newStatus] ?? '📋';

    const content = `
      <h2 class="vp-text"
          style="margin:0 0 6px;color:#1c1917;font-size:22px;font-weight:800;">
        Actualización de tu pedido
      </h2>
      <p class="vp-muted"
         style="margin:0 0 28px;color:#78716c;font-size:14px;">
        Hola <strong>${order.customerName}</strong>, hay novedades sobre tu pedido.
      </p>

      <!-- Order ID -->
      <div style="display:inline-block;background:#f5f5f4;border:1px solid #e7e5e4;
                  border-radius:8px;padding:8px 16px;margin-bottom:28px;">
        <span style="color:#78716c;font-size:12px;font-weight:700;letter-spacing:1px;
                     text-transform:uppercase;">N.º de pedido</span><br>
        <span style="color:#1c1917;font-size:16px;font-weight:800;letter-spacing:2px;">
          #${orderId}
        </span>
      </div>

      <!-- Status card -->
      <div style="background:#f5f5f4;border:1px solid #e7e5e4;border-radius:16px;
                  padding:28px;text-align:center;margin-bottom:8px;">
        <div style="font-size:48px;line-height:1;margin-bottom:12px;">${icon}</div>
        <p class="vp-muted"
           style="margin:0 0 12px;color:#78716c;font-size:13px;text-transform:uppercase;
                  letter-spacing:1px;font-weight:600;">
          Estado actual
        </p>
        <span style="display:inline-block;background:${badge.bg};color:${badge.color};
                     font-size:18px;font-weight:800;padding:10px 28px;border-radius:50px;
                     letter-spacing:0.5px;">
          ${label}
        </span>
      </div>

      ${btn(trackUrl, 'Ver estado del pedido')}
      ${trackLink(trackUrl)}`;

    try {
      await this.resend.emails.send({
        from:    this.from,
        to:      order.customerEmail,
        subject: `${icon} Tu pedido está ${label.toLowerCase()} – Virtual Pet`,
        html:    layout(content),
      });
    } catch (err) {
      this.logger.error(`Error enviando actualización de estado de orden ${order.id}`, err);
    }
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    const content = `
      <h2 class="vp-text"
          style="margin:0 0 6px;color:#1c1917;font-size:22px;font-weight:800;">
        Recuperar contraseña
      </h2>
      <p class="vp-muted"
         style="margin:0 0 24px;color:#78716c;font-size:14px;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Hacé clic en el botón para continuar.
        El enlace expira en <strong>1 hora</strong>.
      </p>

      <!-- Warning box -->
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;
                  padding:14px 18px;margin-bottom:8px;">
        <p style="margin:0;color:#92400e;font-size:13px;">
          🔒 Si no solicitaste esto, ignorá este correo. Tu contraseña no cambiará.
        </p>
      </div>

      ${btn(resetUrl, '🔑 Restablecer contraseña')}
      ${trackLink(resetUrl)}`;

    try {
      await this.resend.emails.send({
        from:    this.from,
        to:      email,
        subject: '🔑 Recuperar contraseña – Virtual Pet',
        html:    layout(content),
      });
    } catch (err) {
      this.logger.error('Error enviando email de recuperación', err);
      throw err;
    }
  }
}
