import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database";
import { Key } from "react";
import connectDB from "@/lib/mongodb";
import Event from "@/database/models/event.model";

const Page = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
    
    const events = await Event.find().sort({ createdAt: -1 }).lean();

    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br/>Event You Can&#39;t Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups and Conferences, All in One Place</p>
            <ExploreBtn/>

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>

                <ul className="events">
                    {events.map((event: IEvent, index: Key | null | undefined) => (
                        <li key={index} className="list-none">
                            <EventCard title={event.title} image={event.image} slug={event.slug} location={event.location} date={event.date} time={event.time} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default Page;