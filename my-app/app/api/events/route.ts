import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import connectDB from "@/lib/mongodb";
import Event from '@/database/models/event.model';

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        // Connect to database first
        await connectDB();
        
        const formData = await req.formData();

        const file = formData.get('image') as File;

        if (!file) return NextResponse.json(
            { message: 'Image file is required' },
            { status: 400 }
        );

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Cloudinary upload fix
        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: 'image', folder: 'devEvent' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result as { secure_url: string });
                }
            ).end(buffer);
        });

        // FormData se baaki fields nikalo
        const event: Record<string, unknown> = {};
        formData.forEach((value, key) => {
            if (key !== 'image') {
                event[key] = value;
            }
        });

        // Image URL add karo
        event.image = uploadResult.secure_url;

        // Normalize mode
        if (event.mode && typeof event.mode === 'string') {
            const modeValue = event.mode.toLowerCase();
            if (modeValue.includes('hybrid')) {
                event.mode = 'hybrid';
            } else if (modeValue.includes('online')) {
                event.mode = 'online';
            } else if (modeValue.includes('offline')) {
                event.mode = 'offline';
            }
        }

        const CreatedEvent = await Event.create(event);

        return NextResponse.json(
            { message: "Event Created Successfully", event: CreatedEvent },
            { status: 201 }
        );

    } catch (e) {
        console.error(e);

        return NextResponse.json(
            {
                message: 'Event creation failed',
                error: e instanceof Error ? e.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Connect to database
        await connectDB();

        // Fetch events
        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        console.error('GET /api/events error:', e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        const errorDetails = e instanceof Error && e.message.includes('MONGODB_URI') 
            ? 'Database connection string not configured. Please set MONGODB_URI environment variable.'
            : errorMessage;
        
        return NextResponse.json({ 
            message: 'Event fetching failed', 
            error: errorDetails 
        }, { status: 500 });
    }
}