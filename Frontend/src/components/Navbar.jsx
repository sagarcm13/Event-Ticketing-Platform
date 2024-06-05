import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">Eventify</Link>
      <ul className="hidden md:flex space-x-4">
        <Link to="/Home" className="hover:text-blue-500">Home</Link>
        <Link to="/cancelTickets" className="hover:text-blue-500">Cancel Tickets</Link>
        <Link to="/contact" className="hover:text-blue-500">Contact Us</Link>
      </ul>
    </nav>
  );
};

export default Navbar;
