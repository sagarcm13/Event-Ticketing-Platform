import { useState } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar'

const BuyTickets = () => {
    const events = {
        eventId: "12345",
        eventName: "Awesome Event",
        totalTickets: 100,
        ticketsSold: 50,
        ticketPrice: 25.00,
        eventDescription: "This is a fantastic event that you won't want to miss! Come join us for fun, food, and entertainment.",
        eventCreator: "John Doe",
        eventDate: "2023-11-21T19:00:00Z",
    };

    const [numTickets, setNumTickets] = useState(1);
    const [account, setAccount] = useState(null);
    const [contractAddress, setContractAddress] = useState('0xYourContractAddress'); // Replace with your contract address

    const handleChange = (e) => {
        setNumTickets(parseInt(e.target.value, 10));
    };

    const handleConnectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
            } catch (error) {
                console.error('Error connecting to MetaMask', error);
                toast.error('Error connecting to MetaMask');
            }
        } else {
            alert('Please install MetaMask to use this feature.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!account) {
            toast.error('Please connect your MetaMask wallet first.');
            return;
        }

        // Convert ticket price to Gwei
        const ticketPriceGwei = ethers.utils.parseUnits(events.ticketPrice.toString(), 'gwei');
        const totalCost = ticketPriceGwei.mul(numTickets);

        const transactionParameters = {
            to: contractAddress,
            from: account,
            value: totalCost.toHexString(),
        };

        try {
            await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
            toast.success('Transaction successful! Tickets purchased.');
        } catch (error) {
            console.error('Error submitting transaction', error);
            toast.error('Transaction failed.');
        }
    };

    const eventDateFormatted = new Date(events.eventDate).toLocaleDateString();

    return (
        <>
        <Navbar />
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
            <ToastContainer />
            <h1 className="text-5xl font-bold mb-8">Buy Tickets</h1>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
                <h2 className="text-3xl font-bold mb-4">{events.eventName}</h2>
                <p className="text-gray-700 mb-2"><strong>Description:</strong> {events.eventDescription}</p>
                <p className="text-gray-700 mb-2"><strong>Date:</strong> {eventDateFormatted}</p>
                <p className="text-gray-700 mb-2"><strong>Total Tickets:</strong> {events.totalTickets}</p>
                <p className="text-gray-700 mb-2"><strong>Tickets Sold:</strong> {events.ticketsSold}</p>
                <p className="text-gray-700 mb-4"><strong>Price per Ticket:</strong> {events.ticketPrice} ETH</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numTickets">
                            Number of Tickets
                        </label>
                        <input
                            id="numTickets"
                            name="numTickets"
                            type="number"
                            placeholder="Number of Tickets"
                            value={numTickets}
                            onChange={handleChange}
                            min={1}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleConnectWallet}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                            {account ? 'Wallet Connected' : 'Connect Wallet'}
                        </button>
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                            Buy Tickets
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default BuyTickets;
