import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const {
      name,
      email,
      clerkId,
      gender,
      birthDate,
      breed,
      image,
      activityLevel,
    } = await request.json();

    if (
      !name ||
      !email ||
      !clerkId ||
      !gender ||
      !birthDate ||
      !breed ||
      !activityLevel
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Вставка данных в таблицу `users`
    await sql`
      INSERT INTO users (name, email, clerk_id, gender, birth_date, image)
      VALUES (${name}, ${email}, ${clerkId}, ${gender}, ${birthDate}, ${image || null})
      ON CONFLICT (clerk_id) DO NOTHING;
    `;

    // Вставка данных в таблицу `dogs`
    const response = await sql`
      INSERT INTO dogs (clerk_id, breed, activity_level)
      VALUES (${clerkId}, ${breed}, ${activityLevel})
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
