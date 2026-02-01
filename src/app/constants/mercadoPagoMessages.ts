export const MERCADO_PAGO_MESSAGES = {
  approved: {
    title: "¡PAGO APROBADO! 🐺",
    description: "Bienvenido a la manada. Tu pedido ya se está preparando.",
    type: "success"
  },
  rejected: {
    title: "PAGO RECHAZADO",
    description: "Algo salió mal. Revisa los datos o intenta con otro método.",
    type: "error"
  },
  cc_rejected_bad_filled_card_number: {
    title: "NÚMERO INVÁLIDO",
    description: "Revisa los números de tu tarjeta e intenta de nuevo.",
    type: "error"
  },
  cc_rejected_bad_filled_date: {
    title: "FECHA INVÁLIDA",
    description: "La fecha de vencimiento es incorrecta.",
    type: "error"
  },
  cc_rejected_bad_filled_security_code: {
    title: "CÓDIGO INCORRECTO",
    description: "El CVV (3 números atrás) no coincide.",
    type: "error"
  },
  cc_rejected_insufficient_amount: {
    title: "FONDOS INSUFICIENTES",
    description: "Tu tarjeta no tiene saldo suficiente para esta compra.",
    type: "error"
  },
  cc_rejected_call_for_authorize: {
    title: "AUTORIZACIÓN REQUERIDA",
    description: "Debes llamar a tu banco para autorizar este pago.",
    type: "warning"
  },
  in_process: {
  title: "PAGO EN REVISIÓN ⏳",
  description: "Tu banco está procesando el pago. Te avisaremos por email.",
  type: "warning"
},
  pending: {
    title: "PAGO PENDIENTE",
    description: "Estamos esperando la confirmación de tu banco u OXXO.",
    type: "warning"
  }
};