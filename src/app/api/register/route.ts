import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/users";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validaciones en el servidor (no confiar solo en el formulario)
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }
    if (String(name).trim().length < 2) {
      return NextResponse.json({ error: "El nombre es demasiado corto." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "El correo no es válido." }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }
    if (await findUserByEmail(email)) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
    }

    const user = await createUser(name, email, password);
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error del servidor." }, { status: 500 });
  }
}
