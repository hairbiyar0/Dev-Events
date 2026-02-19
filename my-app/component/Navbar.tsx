'use client'

import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";

const Navbar = () => {
    const handleNavClick = (linkName: string, href: string) => {
        posthog.capture('nav_link_clicked', {
            link_name: linkName,
            link_href: href,
        });
    };

    return (
        <header>
            <nav>
                <Link href='/' className="logo" onClick={() => handleNavClick('Logo', '/')}>
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
                    <p>DevEvent</p>
                </Link>

                <ul className="cursor-pointer">
                    <Link href="/" onClick={() => handleNavClick('Home', '/')}>Home</Link>
                    <Link href="/Events" onClick={() => handleNavClick('Events', '/Events')}>Events</Link>
                    <Link href="/CreateEvent" onClick={() => handleNavClick('Create Event', '/CreateEvent')}>Create Event</Link>
                </ul>
            </nav>
        </header>
    )
}

export default Navbar;
