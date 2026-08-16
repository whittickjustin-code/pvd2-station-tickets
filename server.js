
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === IN-MEMORY TICKET STORE ===
let tickets = [];
let ticketCounter = 0;

// === API ROUTES ===

// Create a new ticket (from station menu)
app.post('/api/tickets', (req, res) => {
    ticketCounter++;
    const ticket = {
        id: 'TK-' + String(ticketCounter).padStart(3, '0'),
        station: req.body.station || 'Unknown',
        issue: req.body.issue || 'Unknown issue',
        status: 'new',
        createdAt: new Date().toISOString(),
        claimedBy: null,
        escalatedAt: null,
        closedAt: null,
        notes: null,
        flagged: false
    };
    tickets.unshift(ticket);
    res.json({ success: true, ticket });
});

// Get all tickets (for dashboard)
app.get('/api/tickets', (req, res) => {
    res.json({ tickets });
});

// Update a ticket (claim, escalate, resolve, needs-work)
app.patch('/api/tickets/:id', (req, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const { action, username, notes } = req.body;

    switch (action) {
        case 'claim':
            ticket.status = 'reviewing';
            ticket.claimedBy = username || 'unknown';
            break;
        case 'escalate':
            ticket.status = 'escalated';
            ticket.escalatedAt = new Date().toISOString();
            break;
        case 'resolve':
            ticket.status = 'closed';
            ticket.closedAt = new Date().toISOString();
            ticket.notes = notes || 'Resolved';
            ticket.flagged = false;
            break;
        case 'needs-work':
            ticket.status = 'closed';
            ticket.closedAt = new Date().toISOString();
            ticket.notes = notes || 'Needs more work';
            ticket.flagged = true;
            break;
        default:
            return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ success: true, ticket });
});

// Serve station menu
app.get('/station', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'station.html'));
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.listen(PORT, () => {
console.log('PVD2 Station Ticket System running on port ' + PORT);});

