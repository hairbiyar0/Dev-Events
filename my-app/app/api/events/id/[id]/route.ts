import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectDB from "@/lib/mongodb";
import Event from "@/database/models/event.model";

type RouteContext = { params: Promise<{ id: string }> };

// GET a single event by its MongoDB _id (used by the edit page)
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Valid event ID is required." },
        { status: 400 },
      );
    }

    await connectDB();
    const event = await Event.findById(id).lean().exec();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch event." },
      { status: 500 },
    );
  }
}
