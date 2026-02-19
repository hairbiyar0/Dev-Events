'use client'

import Image from "next/image";
import posthog from "posthog-js";

const ExploreBtn = () => {
    const handleClick = () => {
        posthog.capture('explore_events_clicked', {
            source: 'homepage',
        });
    };

    return (
        <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={handleClick}>
        <a href="#events">
            Explore Events
            <Image src="/icons/arrow-down.svg" alt="arrow-down" height={24} width={24}/>
        </a>
        </button>
    )
}
export default ExploreBtn
