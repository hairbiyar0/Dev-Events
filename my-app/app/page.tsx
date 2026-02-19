import ExploreBtn from "@/component/ExploreBtn";
import EventCard from "@/component/EventCard";
import {events} from "@/lib/constant"

const Page = () => {
    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br/>Event You Can&#39;t Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups and Conferences, All in One Place</p>
            <ExploreBtn/>

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>

                <ul className="events">
                    {events.map((event, index) => (
                        <li key={index} className="list-none">
                            <EventCard title={event.title} image={event.image} slug={event.slug} location={event.location} date={event.date}
                                       time={event.time} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default Page