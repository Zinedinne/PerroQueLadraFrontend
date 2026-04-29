"use client";
import { useState } from "react";

export default function FormularioInscripcion({ eventoId, nombreEvento, opcionesPrecios }: any) {
  const [mensaje, setMensaje] = useState("");
  const [precioSeleccionado, setPrecioSeleccionado] = useState(0);
  const [nombrePrecio, setNombrePrecio] = useState("");
  const [edadCalculada, setEdadCalculada] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    Nombre_Participante: "",
    correo: "",
    FechaNacimiento: "",
    Domicilio: "",
    Numero_Telefono: "",
    Rama: "Varonil",
    Talla: "M"
  });

  const calcularEdad = (fecha: string) => {
    if (!fecha) return null;
    const hoy = new Date();
    const cumpleanos = new Date(fecha);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const mes = hoy.getMonth() - cumpleanos.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) edad--;
    return edad;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "FechaNacimiento") setEdadCalculada(calcularEdad(value));
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opcion = opcionesPrecios.find((p: any) => p.id.toString() === e.target.value);
    if (opcion) {
      setPrecioSeleccionado(Number(opcion.Precio));
      setNombrePrecio(opcion.KM);
    } else {
      setPrecioSeleccionado(0);
      setNombrePrecio("");
    }
  };

  const procesarInscripcionYpago = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (precioSeleccionado <= 0) return alert("Selecciona una categoría");
  const tokenUsuario = localStorage.getItem("token");
  if (!tokenUsuario) return alert("Debes iniciar sesión");

  setMensaje("GENERANDO REFERENCIAS DE PAGO...");

  try {
    // --- PASO 1: CREAR LA PREFERENCIA EN MERCADO PAGO PRIMERO ---
    // Esto lo hacemos para obtener el ID de la transacción de MP antes de crear el boleto
    const resMP = await fetch("/api/checkout/create_preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{
          title: `Inscripción: ${nombreEvento} - ${nombrePrecio}`,
          unit_price: precioSeleccionado,
          quantity: 1
        }],
        userEmail: formData.correo
      }),
    });

    const dataMP = await resMP.json();
    
    // Este es el ID de la intención de pago (init_point y preference_id)
    if (!dataMP.id || !dataMP.init_point) {
      throw new Error("No se pudo conectar con Mercado Pago");
    }

    // --- PASO 2: REGISTRAR EL BOLETO EN STRAPI YA CON EL ID DE MP ---
    const resStrapi = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/boletos`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenUsuario}` 
      },
      body: JSON.stringify({
        data: {
          Nombre_Participante: formData.Nombre_Participante,
          correo: formData.correo,
          Numero_Telefono: formData.Numero_Telefono,
          FechaNacimiento: formData.FechaNacimiento,
          Domicilio: formData.Domicilio,
          Rama: formData.Rama,
          Talla: formData.Talla,
          evento: eventoId,
          MP_Status_Detail: "Pendiente",
          // Guardamos el ID de la preferencia aquí mismo
          MP_Payment_ID: dataMP.id 
        }
      })
    });

    const dataBoleto = await resStrapi.json();
    if (!resStrapi.ok) throw new Error(dataBoleto.error?.message || "Error al registrar boleto");

    // --- PASO 3: REDIRIGIR AL USUARIO AL PAGO ---
    // El boleto ya existe en tu DB con el ID de la referencia vinculado
    window.location.href = dataMP.init_point;

  } catch (error: any) {
    console.error(error);
    alert(error.message);
    setMensaje("");
  }
};

  return (
    <div className="bg-zinc-900 p-8 border-2 border-white/5 sticky top-28 shadow-2xl">
      <header className="mb-8 border-b border-white/5 pb-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Inscripción</h2>
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Paso final: Registro y Pago</p>
      </header>
      
      <form onSubmit={procesarInscripcionYpago} className="space-y-4">
        {/* Selector de Categoría */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-orange-500 uppercase tracking-widest">1. Distancia</label>
          <select required onChange={handlePrecioChange} className="w-full bg-black border border-white/10 p-4 text-xs font-bold outline-none focus:border-white transition-all text-white">
            <option value="">-- SELECCIONAR CATEGORÍA --</option>
            {opcionesPrecios.map((op: any) => (
              <option key={op.id} value={op.id}>{op.KM} — ${op.Precio} MXN</option>
            ))}
          </select>
        </div>

        {/* Datos Personales */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">2. Tus Datos</label>
          <input required name="Nombre_Participante" placeholder="Nombre completo" onChange={handleChange} className="w-full bg-black border border-white/10 p-4 text-xs font-bold outline-none focus:border-white transition-all text-white" />
          <input required name="correo" type="email" placeholder="Correo electrónico" onChange={handleChange} className="w-full bg-black border border-white/10 p-4 text-xs font-bold outline-none focus:border-white transition-all text-white" />
          <input required name="Numero_Telefono" placeholder="Teléfono" onChange={handleChange} className="w-full bg-black border border-white/10 p-4 text-xs font-bold outline-none focus:border-white transition-all text-white" />
          
          <div className="space-y-1 pt-2">
              <div className="flex justify-between items-end">
                <span className="text-[8px] text-white/30 uppercase">Nacimiento</span>
                {edadCalculada !== null && (
                    <span className="text-[10px] font-black text-orange-500 italic uppercase">{edadCalculada} AÑOS</span>
                )}
              </div>
              <input required name="FechaNacimiento" type="date" onChange={handleChange} className="w-full bg-black border border-white/10 p-4 text-xs font-bold outline-none focus:border-white transition-all text-white" style={{ colorScheme: 'dark' }} />
          </div>
          <input required name="Domicilio" placeholder="Dirección" onChange={handleChange} className="w-full bg-black border border-white/10 p-4 text-xs font-bold outline-none focus:border-white transition-all text-white" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select name="Rama" onChange={handleChange} className="bg-black border border-white/10 p-4 text-xs font-bold uppercase text-white"><option value="Varonil">Varonil</option><option value="Femenil">Femenil</option></select>
          <select name="Talla" onChange={handleChange} className="bg-black border border-white/10 p-4 text-xs font-bold uppercase text-white"><option value="CH">CH</option><option value="M">M</option><option value="G">G</option><option value="XG">XG</option></select>
        </div>

        <button 
          type="submit" 
          disabled={precioSeleccionado === 0 || mensaje !== ""}
          className={`w-full py-5 font-black uppercase italic tracking-widest transition-all mt-4 ${
            precioSeleccionado > 0 ? 'bg-white text-black hover:bg-orange-600 hover:text-white' : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          {mensaje || `PAGAR $${precioSeleccionado} MXN`}
        </button>
      </form>
    </div>
  );
}