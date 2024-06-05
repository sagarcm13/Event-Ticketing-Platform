// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TicketChain {
    struct Ticket {
        string eventId;
        address owner;
        bool isValid;
    }

    struct Event {
        string eventId;
        string eventName;
        uint256 totalTickets;
        uint256 ticketsSold;
        uint256 ticketPrice;
        string eventDescription;
        bool isActive;
        address eventCreator;
        uint256 eventDate; // Timestamp for the event date
    }

    mapping(string => Event) public eventsById;
    string[] public eventIds;
    mapping(string => Ticket[]) public eventTicketsById;

    uint256 public eventCreationFee = 200 gwei; // Set the event creation fee (for example, 0.01 ether)

    // Function to create a new event
    function createEvent(
        string memory eventId,
        string memory eventName,
        uint256 totalTickets,
        uint256 ticketPrice,
        string memory eventDescription,
        uint256 eventDate // New parameter for event date
    ) public payable {
        // Check if the event ID is already used by an existing event
        require(bytes(eventsById[eventId].eventId).length == 0, "Event ID already exists");

        // Check if the sent value matches the event creation fee
        require(msg.value >= eventCreationFee, "Insufficient event creation fee");

        // Check if the event date is in the future
        require(eventDate > block.timestamp, "Event date must be in the future");

        // Create a new event
        Event memory newEvent = Event({
            eventId: eventId,
            eventName: eventName,
            totalTickets: totalTickets,
            ticketsSold: 0,
            ticketPrice: ticketPrice,
            eventDescription: eventDescription,
            isActive: true,
            eventCreator: msg.sender,
            eventDate: eventDate
        });

        // Add the event to the mapping
        eventsById[eventId] = newEvent;
        eventIds.push(eventId);

        // Refund any excess payment to the event creator
        if (msg.value > eventCreationFee) {
            uint256 excessPayment = msg.value - eventCreationFee;
            payable(msg.sender).transfer(excessPayment);
        }
    }

    function updateEventStatus(string memory eventId, bool newStatus) public {
        require(msg.sender == eventsById[eventId].eventCreator, "Only event creator can update event status");
        eventsById[eventId].isActive = newStatus;
    }

    function getAllEvents() public view returns (Event[] memory) {
        Event[] memory allEvents = new Event[](eventIds.length);
        for (uint256 i = 0; i < eventIds.length; i++) {
            allEvents[i] = eventsById[eventIds[i]];
        }
        return allEvents;
    }

    function buyTickets(string memory eventId, uint256 numberOfTickets) public payable {
        require(bytes(eventsById[eventId].eventId).length > 0, "Event does not exist");
        require(eventsById[eventId].isActive, "Event is not active");
        require(eventsById[eventId].ticketsSold + numberOfTickets <= eventsById[eventId].totalTickets, "Not enough tickets available");
        
        // Ensure the event date is in the future
        require(eventsById[eventId].eventDate > block.timestamp, "Event has already occurred");

        uint256 totalCost = eventsById[eventId].ticketPrice * numberOfTickets;
        require(msg.value >= totalCost, "Insufficient funds");

        for (uint256 i = 0; i < numberOfTickets; i++) {
            Ticket memory newTicket = Ticket({
                eventId: eventId,
                owner: msg.sender,
                isValid: true
            });
            eventTicketsById[eventId].push(newTicket);
        }

        eventsById[eventId].ticketsSold += numberOfTickets;

        if (msg.value > totalCost) {
            uint256 excessPayment = msg.value - totalCost;
            payable(msg.sender).transfer(excessPayment);
        }
    }

    function cancelTickets(string memory eventId) public {
        Ticket[] storage tickets = eventTicketsById[eventId];
        bool hasTickets = false;
        uint256 refundAmount = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].owner == msg.sender && tickets[i].isValid) {
                tickets[i].isValid = false;
                hasTickets = true;
                refundAmount += eventsById[eventId].ticketPrice;
            }
        }
        require(hasTickets, "No tickets found for cancellation");
        payable(msg.sender).transfer(refundAmount);
    }
}
