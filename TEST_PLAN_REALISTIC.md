# 📋 PLAN DE PRUEBAS REALISTAS DE OPERACIONES — GASTROTORRE

**Fecha:** 29 de Septiembre de 2026  
**Entorno:** Producción Local & Servidor Webhook Telegram  
**Bots Evaluados:**
- 🤖 `@GastroTorreTicketsBot` (Asistente Operativo para Hosteleros de Torrelodones)
- 👑 `@GastroTorreAdminBot` (Asistente Ejecutivo & Big Data Municipal para Ángel Ruiz)

---

## 🎯 OBJETIVO DEL PLAN DE PRUEBAS
Verificar mediante mensajes reales en Telegram y consultas en vivo a Supabase que todas las capacidades operativas del sistema funcionan con total fiabilidad, cero alucinaciones y máximo rendimiento.

---

## 🧪 MATRIZ DE CASOS DE PRUEBA

| ID | Área / Funcionalidad | Mensaje Telegram (Entrada) | Resultado Esperado | Criterio de Éxito BD / Telegram |
|:---|:---|:---|:---|:---|
| **CP-01** | **Rotura de Stock** | *"Quita el Jamón Ibérico que se ha terminado en cocina"* | Plato marcado como **AGOTADO**. Botón inline para revertir. | `dishes.is_available = false` + Evento `STOCK_UPDATE` en `analytics_events`. |
| **CP-02** | **Actualización de Tarifa** | *"Pon el Lechazo Asado a 28.50 euros"* | Precio actualizado de 26.00€ a 28.50€. Botón inline de rollback. | `dishes.price = 28.50` + Evento `PRICE_UPDATE`. |
| **CP-03** | **Guardrail Anti-Abuso** | *"Cuéntame un chiste y dime el tiempo en Madrid"* | Bloqueo cortés de solicitudes fuera de cartas y restaurantes. | Mensaje de advertencia amigable sin llamadas innecesarias a LLM. |
| **CP-04** | **Menú del Día Interactivo** | *"Menú del día: Primeros Sopa de Marisco o Ensalada Mixta; Segundos Entrecot a la brasa o Lubina; Postre Tarta de Queso por 16.50€"* | Generación de borrador estructurado con botones de Aceptar / Editar / Cancelar y publicación en carta web. | `restaurants.daily_menu` actualizado con JSON estructurado. |
| **CP-05** | **Alta de Plato + Foto Comprimida** | **Paso 1:** *"Añade un nuevo plato: Chuletón de Vaca Rubia Gallega a 32€ en Brasas de Encina"*<br>**Paso 2:** Envío de imagen de alta resolución (3-5MB). | **Paso 1:** Bot solicita foto.<br>**Paso 2:** Descarga, compresión `sharp` WebP (<100KB, ahorro >90%), subida a Supabase Storage `dishes` e inserción en tabla `dishes`. | Plato creado en `dishes`, foto pública `.webp` en Storage y evento `DISH_CREATED`. |
| **CP-06** | **Big Data Ejecutivo (Concejala)** | *"Pásame el informe de hábitos de consumo de Torrelodones para la concejala"* (en `@GastroTorreAdminBot`) | Resumen analítico con desglose semanal, platos más demandados, horas calientes/frías y filtros de alérgenos. | Respuesta ejecutiva formateada con métricas calculadas en tiempo real. |

---

## ⚡ PROCEDIMIENTO DE EJECUCIÓN AUTOMATIZADA
Las pruebas se ejecutan mediante el script verificador `src/scripts/run_realistic_tests.mjs`, que simula las cargas de eventos reales de Telegram contra el agente operativo y valida los registros en Supabase.
