import clientPromise from "@/lib/mongodb";



import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const client = await clientPromise;
  const db = client.db("planificateur");
  const collection = db.collection("seances");

  await collection.insertOne(body);

  return NextResponse.json({ success: true });
}

export async function GET() {
  const client = await clientPromise;
  const db = client.db("planificateur");
  const collection = db.collection("seances");

  const data = await collection.find({}).toArray();

  return NextResponse.json(data);
}
