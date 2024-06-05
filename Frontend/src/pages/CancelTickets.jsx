import { useState } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar'


const CancelTickets = () => {
    const [eventId, setEventId] = useState('');
    const [account, setAccount] = useState(null);
    const [contractAddress, setContractAddress] = useState('0xYourContractAddress'); // Replace with your contract address

    const handleChangeEventId = (e) => {
        setEventId(e.target.value);
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

        // Assume the refund process is handled in the smart contract
        const contractAbi = [
            // Replace with your contract's ABI
            "function refundTickets(uint256 eventId) external"
        ];

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        try {
            const transaction = await contract.refundTickets(eventId);
            await transaction.wait();
            toast.success('Transaction successful! Tickets cancelled.');
        } catch (error) {
            console.error('Error submitting transaction', error);
            toast.error('Transaction failed.');
        }
    };

    return (<>
        <Navbar />
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
            <ToastContainer />
            <h1 className="text-5xl font-bold mb-8">Cancel Tickets</h1>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventId">
                            Event ID
                        </label>
                        <input
                            id="eventId"
                            name="eventId"
                            type="text"
                            placeholder="Event ID"
                            value={eventId}
                            onChange={handleChangeEventId}
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
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancel Tickets
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>
    );
};

export default CancelTickets;
