import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import eventContractAbi from '../../../Backend/artifacts/contracts/TicketChain.sol/TicketChain.json'; // Adjust the path accordingly

const CreateEvent = () => {
    const [eventDetails, setEventDetails] = useState({
        eventId: '',
        eventName: '',
        totalTickets: '',
        ticketsSold: 0,
        ticketPrice: '',
        eventDescription: '',
        isActive: true,
        eventCreator: '',
        eventDate: '',
    });

    const [account, setAccount] = useState(null);
    const [accounts, setAccounts] = useState([]);

    const handleChange = (e) => {
        setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
    };

    const handleConnectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccounts(accounts);
                setAccount(accounts[0]);
                setEventDetails({ ...eventDetails, eventCreator: accounts[0] });
            } catch (error) {
                console.error('Error connecting to MetaMask', error);
            }
        } else {
            alert('Please install MetaMask to use this feature.');
        }
    };

    const handleAccountChange = (event) => {
        const selectedAccount = event.target.value;
        setAccount(selectedAccount);
        setEventDetails({ ...eventDetails, eventCreator: selectedAccount });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!account) {
            alert('Please connect your MetaMask wallet first.');
            return;
        }

        // Convert ticket price from Gwei to Wei
        const ticketPriceWei = ethers.utils.parseUnits(eventDetails.ticketPrice, 'gwei');

        // Set up the provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = provider.getSigner();

        // Set up the contract
        const contractAddress = '0x752934E1B5608eE2789dF0238B71977ed72B7459'; // Replace with your contract address
        const contract = new ethers.Contract(contractAddress, eventContractAbi.abi, signer);

        // Convert event creation fee to Wei (200 Gwei)
        const eventCreationFeeWei = ethers.parseUnits('200', 'gwei');

        try {
            // Call the createEvent function on the contract
            const transaction = await contract.createEvent(
                eventDetails.eventId,
                eventDetails.eventName,
                parseInt(eventDetails.totalTickets),
                ticketPriceWei,
                eventDetails.eventDescription,
                Math.floor(new Date(eventDetails.eventDate).getTime() / 1000), // Convert date to Unix timestamp
                {
                    value: eventCreationFeeWei, // Add the event creation fee to the transaction
                }
            );

            const txReceipt = await transaction.wait();
            console.log('Transaction receipt:', txReceipt);
            alert('Transaction successful! Event created.');
        } catch (error) {
            console.error('Error submitting transaction', error);
            alert('Transaction failed.');
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                setAccounts(accounts);
                setAccount(accounts[0]);
                setEventDetails({ ...eventDetails, eventCreator: accounts[0] });
            });
        }
    }, [eventDetails]);

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-5xl font-bold mb-8">Create an Event</h1>
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventId">
                            Event ID
                        </label>
                        <input
                            id="eventId"
                            name="eventId"
                            type="text"
                            placeholder="Event ID"
                            value={eventDetails.eventId}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventName">
                            Event Name
                        </label>
                        <input
                            id="eventName"
                            name="eventName"
                            type="text"
                            placeholder="Event Name"
                            value={eventDetails.eventName}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalTickets">
                            Total Tickets
                        </label>
                        <input
                            id="totalTickets"
                            name="totalTickets"
                            type="number"
                            min={1}
                            placeholder="Total Tickets"
                            value={eventDetails.totalTickets}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ticketPrice">
                            Ticket Price (Gwei)
                        </label>
                        <input
                            id="ticketPrice"
                            name="ticketPrice"
                            type="number"
                            min={1}
                            placeholder="Ticket Price"
                            value={eventDetails.ticketPrice}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDescription">
                            Event Description
                        </label>
                        <textarea
                            id="eventDescription"
                            name="eventDescription"
                            placeholder="Event Description"
                            value={eventDetails.eventDescription}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDate">
                            Event Date
                        </label>
                        <input
                            id="eventDate"
                            name="eventDate"
                            type="date"
                            value={eventDetails.eventDate}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <p className="text-red-500 text-xs italic">Note: Creating an event requires a fee of 200 Gwei.</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventCreator">
                            Event Creator Address
                        </label>
                        <select
                            id="eventCreator"
                            name="eventCreator"
                            value={account || ''}
                            onChange={handleAccountChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            {accounts.map((acc) => (
                                <option key={acc} value={acc}>
                                    {acc}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handleConnectWallet}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            {account ? 'Wallet Connected' : 'Connect Wallet'}
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateEvent;
