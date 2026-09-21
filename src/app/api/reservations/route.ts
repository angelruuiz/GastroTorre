import { NextResponse } from 'next/server';

/**
 * GastroTorre is a local gastronomy directory and digital menu platform for Torrelodones.
 * Online table booking POS is not supported by design; customers contact restaurants directly
 * via direct phone call (tel:) or direct WhatsApp (wa.me:).
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'GastroTorre fomenta el contacto directo con cada restaurante (teléfono o WhatsApp). No se almacenan reservas internas.',
    data: [],
  });
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'GastroTorre no procesa reservas online directas. Por favor contacta al restaurante directamente por teléfono o WhatsApp.',
    },
    { status: 400 }
  );
}
