import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Navbar from '../components/Navbar';
import { ethers } from 'ethers';
import eventContractAbi from '../../../Backend/artifacts/contracts/TicketChain.sol/TicketChain.json'; 
const Home = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);

    const contractAddress = '0x752934E1B5608eE2789dF0238B71977ed72B7459';
    const fetchEvents = async () => {
        try {
            if (!window.ethereum) {
                console.error('MetaMask is not installed');
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, eventContractAbi.abi, signer);

            const eventsFromContract = await contract.getAllEvents();
            console.log(eventsFromContract);

            // Format the events data
            const formattedEvents = eventsFromContract.map(event => ({
                eventId: event.eventId,
                eventName: event.eventName,
                eventDate: new Date(Number(event.eventDate) * 1000).toLocaleDateString(),
                totalTickets: event.totalTickets.toString(), // Convert BigInt to string
                ticketPrice: ethers.formatEther(event.ticketPrice.toString()), // Convert Wei to Ether
                eventDescription: event.eventDescription,
                isActive: event.isActive,
                eventCreator: event.eventCreator,
                ticketsSold: event.ticketsSold.toString()
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const settings = {
        dots: true,
        infinite: events.length > 3,
        speed: 500,
        slidesToShow: Math.min(3, events.length),
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(2, events.length),
                    slidesToScroll: 1,
                    infinite: events.length > 2,
                    dots: true,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: Math.min(1, events.length),
                    slidesToScroll: 1,
                    infinite: events.length > 1,
                    dots: true,
                },
            },
        ],
    };

    const buyTickets = eventId => {
        navigate(`/buyTickets?eventId=${eventId}`);
    };

    const EventCard = ({ eventId, eventName, eventDate, totalTickets, ticketPrice, eventDescription, isActive, eventCreator, ticketsSold }) => {
        return (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden m-4 p-6">
                <h3 className="text-2xl font-bold mb-2">{eventName}</h3>
                <p className="text-gray-600 mb-4">{eventDate}</p>
                <p className="text-gray-600 mb-4">Total Tickets: {totalTickets}</p>
                <p className="text-gray-600 mb-4">Avaliable Tickets: {totalTickets -ticketsSold}</p>
                <p className="text-gray-600 mb-4">Ticket Price: {ticketPrice} Wei</p>
                <button
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-500 transition duration-300"
                    onClick={() => buyTickets(eventId)}
                >
                    Buy Tickets
                </button>
            </div>
        );
    };

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen flex flex-col">
                <section className="bg-blue-600 text-white py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-5xl font-bold mb-4">Welcome to Eventify</h1>
                        <p className="text-xl mb-8">Your one-stop platform for all event tickets</p>
                        <Link to="/create-event">
                            <button className="bg-white text-blue-600 font-bold py-2 px-4 rounded-full hover:bg-gray-200 transition duration-300">
                                Create Event
                            </button>
                        </Link>
                    </div>
                </section>

                <section className="container mx-auto px-6 py-16 flex-grow">
                    <h2 className="text-4xl font-bold text-center mb-12">Upcoming Events</h2>
                    {events.length > 0 ? (
                        <Slider {...settings}>
                            {events.map((event, index) => (
                                <div key={index}>
                                    <EventCard {...event} />
                                </div>
                            ))}
                        </Slider>
                    ) : (
                        <p className="text-center text-gray-600">No upcoming events found.</p>
                    )}
                </section>

                <footer className="bg-gray-800 text-white py-8 mt-auto">
                    <div className="container mx-auto px-6 text-center">
                        <p>&copy; 2024 Eventify. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Home;
