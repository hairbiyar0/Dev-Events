import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isValidObjectId } from "mongoose";
import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/models/event.model";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Plain-object version of IEvent returned by .lean()
type LeanEvent = Omit<IEvent, keyof Document>;

type ErrorCode = "INVALID_SLUG" | "INVALID_ID" | "EVENT_NOT_FOUND" | "INTERNAL_SERVER_ERROR";
interface ErrorResponse {
  message: string;
  code: ErrorCode;
}

// Validate slug format
const isValidSlug = (value: string): boolean => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

type RouteContext = { params: Promise<{ slug: string }> };

// ─── GET by slug ───────────────────────────────────────────────
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug: rawSlug } = await context.params;

    if (!rawSlug || typeof rawSlug !== "string") {
      return NextResponse.json(
        { message: "Slug is required.", code: "INVALID_SLUG" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    const slug = rawSlug.trim().toLowerCase();

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { message: "Slug format is invalid.", code: "INVALID_SLUG" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    await connectDB();
    const event = (await Event.findOne({ slug }).lean().exec()) as LeanEvent | null;

    if (!event) {
      return NextResponse.json(
        { message: "Event not found.", code: "EVENT_NOT_FOUND" } satisfies ErrorResponse,
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Event fetched successfully", event }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Unexpected error while fetching event.", code: "INTERNAL_SERVER_ERROR" } satisfies ErrorResponse,
      { status: 500 },
    );
  }
}

// ─── PUT — update event by _id ─────────────────────────────────
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { slug: id } = await context.params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Valid event ID is required.", code: "INVALID_ID" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    await connectDB();

    const formData = await req.formData();
    const updates: Record<string, unknown> = {};

    formData.forEach((value, key) => {
      if (key !== "image") updates[key] = value;
    });

    // Handle optional image re-upload
    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: "devEvent" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string });
            },
          )
          .end(buffer);
      });

      updates.image = uploadResult.secure_url;
    }

    // Normalize mode
    if (updates.mode && typeof updates.mode === "string") {
      const modeValue = updates.mode.toLowerCase();
      if (modeValue.includes("hybrid")) updates.mode = "hybrid";
      else if (modeValue.includes("online")) updates.mode = "online";
      else if (modeValue.includes("offline")) updates.mode = "offline";
    }

    const updated = await Event.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Event not found.", code: "EVENT_NOT_FOUND" } satisfies ErrorResponse,
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Event updated successfully", event: updated },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Event update failed.", code: "INTERNAL_SERVER_ERROR" } satisfies ErrorResponse,
      { status: 500 },
    );
  }
}

// ─── DELETE — remove event by _id ──────────────────────────────
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { slug: id } = await context.params;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Valid event ID is required.", code: "INVALID_ID" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    await connectDB();
    const deleted = await Event.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Event not found.", code: "EVENT_NOT_FOUND" } satisfies ErrorResponse,
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Event deletion failed.", code: "INTERNAL_SERVER_ERROR" } satisfies ErrorResponse,
      { status: 500 },
    );
  }
}
