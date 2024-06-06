import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import eventContractAbi from '../../../Backend/artifacts/contracts/TicketChain.sol/TicketChain.json'; // Adjust the path accordingly

const BuyTickets = () => {
    const [eventDetails, setEventDetails] = useState(null);
    const [numTickets, setNumTickets] = useState(1); // Initialize numTickets with a default value
    const [account, setAccount] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [contractAddress, setContractAddress] = useState('0x752934E1B5608eE2789dF0238B71977ed72B7459'); // Replace with your contract address
    
    const getEventDetails = async (eventId) => {
        try {
            // Set up the provider and signer
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, eventContractAbi.abi, provider);
            // Fetch event details from the contract
            const events = await contract.getAllEvents();
            const event = events.find(event => event[0] === eventId);
            console.log(event);
            if (event) {
                setEventDetails({
                    eventId: event[0],
                    eventName: event[1],
                    totalTickets: Number(event[2]),
                    ticketsSold: Number(event[3]),
                    ticketPrice: ethers.formatEther(event[4].toString()),
                    eventDescription: event[5],
                    eventCreator: event[7],
                    eventDate: new Date(Number(event[8]) * 1000).toISOString(),
                });
            } else {
                toast.error('Event not found');
            }
        } catch (error) {
            console.error('Error fetching event details', error);
            toast.error('Error fetching event details');
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get('eventId');
        if (eventId) {
            getEventDetails(eventId);
        }

        const handleAccountsChanged = (newAccounts) => {
            if (newAccounts.length > 0) {
                setAccounts(newAccounts);
                setAccount(newAccounts[0]);
            } else {
                setAccount('');
            }
        };

        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' }).then(handleAccountsChanged);
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const handleChange = (e) => {
        setNumTickets(parseInt(e.target.value, 10));
    };

    const handleConnectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccounts(accounts);
                setAccount(accounts[0]);
            } catch (error) {
                console.error('Error connecting to MetaMask', error);
                toast.error('Error connecting to MetaMask');
            }
        } else {
            alert('Please install MetaMask to use this feature.');
        }
    };

    const handleAccountChange = (e) => {
        setAccount(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!account) {
            toast.error('Please connect your MetaMask wallet first.');
            return;
        }

        if (!eventDetails) {
            toast.error('Event details not loaded.');
            return;
        }

        try {
            // Convert ticket price to BigNumber in wei
            const ticketPriceWei = ethers.parseUnits(eventDetails.ticketPrice.toString(), 'ether');

            const ethereum = window.ethereum;
            if (ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const contract = new ethers.Contract(contractAddress, eventContractAbi.abi, signer);
                    console.log(contract);
                    const transaction = await contract.buyTickets(eventDetails.eventId, numTickets, { value: ticketPriceWei });

                    // Wait for transaction to complete
                    const txReceipt = await transaction.wait();
                    console.log('Transaction receipt:', txReceipt);
                    alert('Transaction successful! Event created.');
                } catch (error) {
                    console.error('Error sending transaction:', error);
                    toast.error('Transaction failed.');
                }
            } else {
                toast.error('Please install MetaMask to use this feature.');
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            toast.error('Error in transaction.');
        }
    };

    if (!eventDetails) {
        return (
            <>
                <Navbar />
                <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
                    <ToastContainer />
                    <h1 className="text-5xl font-bold mb-8">Loading...</h1>
                </div>
            </>
        );
    }

    const eventDateFormatted = new Date(eventDetails.eventDate).toLocaleDateString();

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
                <ToastContainer />
                <h1 className="text-5xl font-bold mb-8">Buy Tickets</h1>
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
                    <h2 className="text-3xl font-bold mb-4">{eventDetails.eventName}</h2>
                    <p className="text-gray-700 mb-2"><strong>Description:</strong> {eventDetails.eventDescription}</p>
                    <p className="text-gray-700 mb-2"><strong>Date:</strong> {eventDateFormatted}</p>
                    <p className="text-gray-700 mb-2"><strong>Total Tickets:</strong> {eventDetails.totalTickets}</p>
                    <p className="text-gray-700 mb-2"><strong>Tickets Sold:</strong> {eventDetails.ticketsSold}</p>
                    <p className="text-gray-700 mb-4"><strong>Price per Ticket:</strong> {eventDetails.ticketPrice} ETH</p>

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
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="account">
                                Enter Account Address
                            </label>
                            <input
                                id="account"
                                name="account"
                                type="text"
                                placeholder="Account Address"
                                value={account}
                                onChange={handleAccountChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
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
