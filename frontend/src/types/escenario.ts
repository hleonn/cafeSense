export interface Escenario {
  id?: number
  nombre: string
  descripcion: string
  cafe_id: number
  cafe_nombre: string
  precio_original: number
  precio_nuevo: number
  porcentaje_cambio: number
  impacto_lineal: number
  impacto_rf: number
  recomendacion: string
  fecha?: string
}

export interface EscenarioGuardado extends Escenario {
  id: number
  fecha: string
}
