/**
 * Journey Air — Backend API Server
 * 
 * Simulates real airline API integrations:
 * - Amadeus GDS: Flight search, status, rebooking
 * - Google Maps Platform: Terminal navigation & walking directions
 * - SITA BagJourney: Real-time baggage tracking
 * - Journey Air Internal: Passenger profiles, disruption engine
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ============================================================
// MOCK DATA
// ============================================================

const passengers = {
    'PAX-001': {
        id: 'PAX-001',
        name: 'Luthfi',
        email: 'luthfi@example.com',
        loyaltyTier: 'Gold',
        bookingRef: 'JA-X7K9M2',
        flights: ['JA204', 'JA512'],
        baggage: ['SW-82749102'],
        preferences: { seat: 'window', meal: 'standard', notifications: true }
    }
};

const flights = {
    'JA204': {
        flightNumber: 'JA204',
        airline: 'Journey Air',
        origin: { code: 'SFO', city: 'San Francisco', terminal: "Int'l", gate: 'B14' },
        destination: { code: 'LHR', city: 'London', terminal: '5', gate: 'A12' },
        scheduled: { departure: '2026-04-13T10:30:00-07:00', arrival: '2026-04-14T06:30:00+01:00' },
        actual: { departure: '2026-04-13T12:15:00-07:00', arrival: '2026-04-14T08:15:00+01:00' },
        status: 'delayed',
        delayMinutes: 105,
        delayReason: 'Late incoming aircraft from Denver (JA118)',
        aircraft: 'Boeing 787-9 Dreamliner',
        seatMap: { available: 42, total: 290 },
        boardingGroup: 2,
        boardingTime: '2026-04-13T11:45:00-07:00',
        gateCloses: '2026-04-13T12:00:00-07:00'
    },
    'JA512': {
        flightNumber: 'JA512',
        airline: 'Journey Air',
        origin: { code: 'LHR', city: 'London Heathrow', terminal: '5', gate: 'C22' },
        destination: { code: 'CDG', city: 'Paris', terminal: '2E', gate: 'K45' },
        scheduled: { departure: '2026-04-14T14:05:00+01:00', arrival: '2026-04-14T16:20:00+02:00' },
        actual: null,
        status: 'on-time',
        delayMinutes: 0,
        aircraft: 'Airbus A320neo',
        connectionRisk: 'at-risk',
        minimumConnectionTime: 45,
        estimatedConnectionTime: 38
    },
    'JA712': {
        flightNumber: 'JA712',
        airline: 'Journey Air',
        origin: { code: 'SFO', city: 'San Francisco', terminal: "Int'l", gate: 'D8' },
        destination: { code: 'LHR', city: 'London', terminal: '5', gate: 'B19' },
        scheduled: { departure: '2026-04-13T14:30:00-07:00', arrival: '2026-04-14T07:20:00+01:00' },
        status: 'on-time',
        via: 'ORD',
        aircraft: 'Boeing 777-300ER',
        seatMap: { available: 18, total: 350 }
    },
    'BA882': {
        flightNumber: 'BA882',
        airline: 'British Airways',
        origin: { code: 'SFO', city: 'San Francisco', terminal: "Int'l", gate: 'A22' },
        destination: { code: 'LHR', city: 'London', terminal: '5', gate: 'C8' },
        scheduled: { departure: '2026-04-13T15:40:00-07:00', arrival: '2026-04-14T06:55:00+01:00' },
        status: 'on-time',
        aircraft: 'Airbus A380',
        partnerAirline: true,
        seatMap: { available: 34, total: 469 }
    }
};

const baggage = {
    'SW-82749102': {
        tagId: 'SW-82749102',
        passenger: 'PAX-001',
        flight: 'JA204',
        weight: '23.4 kg',
        description: 'Black Samsonite Hardshell',
        status: 'loaded',
        currentLocation: 'Aircraft hold — JA204',
        journey: [
            { stage: 'checked', timestamp: '2026-04-13T08:12:00-07:00', location: 'SFO Terminal Int\'l Check-in Desk 14', status: 'complete' },
            { stage: 'security-screened', timestamp: '2026-04-13T08:34:00-07:00', location: 'SFO TSA Baggage Screening', status: 'complete' },
            { stage: 'sorted', timestamp: '2026-04-13T09:05:00-07:00', location: 'SFO Automated Sorting Facility', status: 'complete' },
            { stage: 'loaded', timestamp: '2026-04-13T09:48:00-07:00', location: 'Aircraft hold — JA204, Position 3L', status: 'current' },
            { stage: 'in-transit', timestamp: null, location: 'In flight', status: 'pending' },
            { stage: 'unloaded', timestamp: null, location: 'LHR Terminal 5 Arrivals', status: 'pending' },
            { stage: 'carousel', timestamp: null, location: 'LHR Carousel 7', status: 'pending' }
        ]
    }
};

const disruptions = [
    { id: 'DIS-001', flight: 'JA204', type: 'delay', severity: 'moderate', paxAffected: 186, autoRecoveryRate: 72, timestamp: '2026-04-13T09:15:00-07:00' },
    { id: 'DIS-002', flight: 'JA118', type: 'cancelled', severity: 'severe', paxAffected: 210, autoRecoveryRate: 61, timestamp: '2026-04-13T08:45:00-07:00' },
    { id: 'DIS-003', flight: 'JA305', type: 'delay', severity: 'moderate', paxAffected: 142, autoRecoveryRate: 89, timestamp: '2026-04-13T07:30:00-07:00' },
    { id: 'DIS-004', flight: 'JA520', type: 'gate-change', severity: 'low', paxAffected: 98, autoRecoveryRate: 95, timestamp: '2026-04-13T10:00:00-07:00' },
    { id: 'DIS-005', flight: 'JA412', type: 'delay', severity: 'moderate', paxAffected: 174, autoRecoveryRate: 45, timestamp: '2026-04-13T11:20:00-07:00' }
];

const recoveryOptions = [
    {
        id: 'REC-001',
        flight: 'JA712',
        label: 'JA712 via Chicago',
        recommended: true,
        airline: 'Journey Air',
        route: 'SFO → ORD → LHR',
        departure: '2:30 PM',
        arrival: '7:20 AM +1',
        arrivalDiff: '40 min earlier',
        seatClass: 'Economy Plus',
        tags: ['Same airline', 'Recommended'],
        description: 'Direct reroute via ORD. Arrives 40 min earlier than your original plan.',
        details: { aircraft: 'Boeing 777-300ER', wifi: true, entertainment: 'In-seat screens', legroom: '34"', meal: 'Complimentary dinner' }
    },
    {
        id: 'REC-002',
        flight: 'BA882',
        label: 'BA882 Direct to London',
        recommended: false,
        airline: 'British Airways',
        route: 'SFO → LHR (direct)',
        departure: '3:40 PM',
        arrival: '6:55 AM +1',
        arrivalDiff: '1h 05m earlier',
        seatClass: 'World Traveller',
        tags: ['Partner airline'],
        description: 'British Airways direct flight. Earlier arrival, partner airline ticket.',
        details: { aircraft: 'Airbus A380', wifi: true, entertainment: 'In-seat screens', legroom: '31"', meal: 'Complimentary dinner' }
    },
    {
        id: 'REC-003',
        flight: 'JA204',
        label: 'JA204 (Stay on this flight)',
        recommended: false,
        airline: 'Journey Air',
        route: 'SFO → LHR (original)',
        departure: '12:15 PM (delayed)',
        arrival: '8:15 AM +1',
        arrivalDiff: '1h 45m later',
        seatClass: 'Economy',
        tags: ['Same airline', 'Connection rebooked'],
        description: 'Stay on JA204. We\'ll rebook your London connection to a later departure.',
        details: { aircraft: 'Boeing 787-9', wifi: true, entertainment: 'In-seat screens', legroom: '32"', meal: 'Complimentary dinner', connectionRebooked: 'JA516 at 16:30' }
    }
];

// Terminal navigation data (simulates Google Maps indoor)
const terminalNavigation = {
    'LHR-T5': {
        airport: 'London Heathrow',
        terminal: 'Terminal 5',
        steps: [
            { id: 1, instruction: 'Exit aircraft at Gate A12', distance: '0m', duration: '2 min', icon: '🛬' },
            { id: 2, instruction: 'Follow signs to Terminal Connections', distance: '200m', duration: '3 min', icon: '🚶' },
            { id: 3, instruction: 'Take the inter-terminal train to T5B', distance: '1.2km', duration: '4 min', icon: '🚊' },
            { id: 4, instruction: 'Security re-screening at T5B', distance: '50m', duration: '8 min', icon: '🛂' },
            { id: 5, instruction: 'Walk to Gate C22', distance: '400m', duration: '5 min', icon: '🚶' },
            { id: 6, instruction: 'Arrive at Gate C22 — JA512', distance: '0m', duration: '0 min', icon: '✈️' }
        ],
        totalDistance: '1.85 km',
        totalDuration: '22 min',
        accessibility: { wheelchairRoute: true, elevatorRequired: false, movingWalkways: 3 }
    }
};

// Destination info (simulates weather/travel APIs)
const destinations = {
    'LHR': {
        city: 'London',
        country: 'United Kingdom',
        flag: '🇬🇧',
        weather: { temp: 14, condition: 'Cloudy', humidity: 72, wind: '15 km/h NW' },
        timezone: 'Europe/London',
        utcOffset: '+01:00',
        sunrise: '06:12',
        sunset: '19:48',
        currency: { code: 'GBP', symbol: '£', rate: 0.79 },
        tips: [
            'Heathrow Express runs every 15 min to Paddington (£25, pre-book for £5.50 off)',
            'The Elizabeth Line (Crossrail) is the cheapest way into central London (£12.80)',
            'Free WiFi available throughout all Heathrow terminals',
            'UK uses Type G plugs — bring an adapter if needed'
        ],
        emergency: { police: '999', ambulance: '999', embassy: '+44 20 7499 9000' }
    }
};

// ============================================================
// HELPER: Simulate network latency
// ============================================================
function simulateLatency(min = 50, max = 200) {
    return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

// ============================================================
// API ROUTES — Amadeus (Flight Data)
// ============================================================

// GET /api/flights — List all flights
app.get('/api/flights', async (req, res) => {
    await simulateLatency();
    res.json({
        source: 'amadeus-gds',
        timestamp: new Date().toISOString(),
        count: Object.keys(flights).length,
        flights: Object.values(flights)
    });
});

// GET /api/flights/:flightNumber — Flight details
app.get('/api/flights/:flightNumber', async (req, res) => {
    await simulateLatency();
    const flight = flights[req.params.flightNumber.toUpperCase()];
    if (!flight) return res.status(404).json({ error: 'Flight not found', source: 'amadeus-gds' });
    res.json({ source: 'amadeus-gds', timestamp: new Date().toISOString(), flight });
});

// GET /api/flights/:flightNumber/status — Real-time status
app.get('/api/flights/:flightNumber/status', async (req, res) => {
    await simulateLatency(100, 300);
    const flight = flights[req.params.flightNumber.toUpperCase()];
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    res.json({
        source: 'amadeus-gds',
        timestamp: new Date().toISOString(),
        flightNumber: flight.flightNumber,
        status: flight.status,
        delayMinutes: flight.delayMinutes || 0,
        delayReason: flight.delayReason || null,
        gate: flight.origin.gate,
        terminal: flight.origin.terminal,
        scheduled: flight.scheduled,
        actual: flight.actual
    });
});

// ============================================================
// API ROUTES — Recovery / Rebooking
// ============================================================

// GET /api/recovery/:passengerId — Get recovery options
app.get('/api/recovery/:passengerId', async (req, res) => {
    await simulateLatency(100, 400);
    const pax = passengers[req.params.passengerId];
    if (!pax) return res.status(404).json({ error: 'Passenger not found' });
    res.json({
        source: 'journey-air-recovery-engine',
        timestamp: new Date().toISOString(),
        passenger: { id: pax.id, name: pax.name },
        disruption: { flight: 'JA204', type: 'delay', delayMinutes: 105 },
        options: recoveryOptions,
        recommendation: 'REC-001',
        expiresIn: '45 min'
    });
});

// POST /api/recovery/:passengerId/confirm — Confirm rebooking
app.post('/api/recovery/:passengerId/confirm', async (req, res) => {
    await simulateLatency(200, 500);
    const { optionId } = req.body;
    const option = recoveryOptions.find(o => o.id === optionId);
    if (!option) return res.status(400).json({ error: 'Invalid recovery option' });
    res.json({
        source: 'journey-air-recovery-engine',
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        confirmationCode: 'REC-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        newFlight: option.flight,
        message: `Successfully rebooked to ${option.label}. Your new boarding pass is ready.`,
        boardingPassUrl: `/api/boarding-pass/PAX-001/${option.flight}`
    });
});

// ============================================================
// API ROUTES — SITA BagJourney (Baggage)
// ============================================================

// GET /api/baggage/:tagId — Baggage status
app.get('/api/baggage/:tagId', async (req, res) => {
    await simulateLatency();
    const bag = baggage[req.params.tagId];
    if (!bag) return res.status(404).json({ error: 'Baggage tag not found', source: 'sita-bagjourney' });
    res.json({
        source: 'sita-bagjourney',
        timestamp: new Date().toISOString(),
        tag: bag.tagId,
        status: bag.status,
        currentLocation: bag.currentLocation,
        weight: bag.weight,
        description: bag.description,
        journey: bag.journey,
        estimatedCarousel: 'Carousel 7',
        estimatedDelivery: '25 min after landing'
    });
});

// GET /api/baggage/:tagId/live — Live tracking stream
app.get('/api/baggage/:tagId/live', async (req, res) => {
    await simulateLatency();
    const bag = baggage[req.params.tagId];
    if (!bag) return res.status(404).json({ error: 'Baggage not found' });

    const currentStage = bag.journey.find(j => j.status === 'current');
    res.json({
        source: 'sita-bagjourney',
        timestamp: new Date().toISOString(),
        tagId: bag.tagId,
        currentStage: currentStage?.stage || 'unknown',
        lastScan: currentStage?.timestamp || null,
        lastLocation: currentStage?.location || null,
        nextExpected: bag.journey.find(j => j.status === 'pending')?.stage || 'delivered',
        confidence: 0.96
    });
});

// ============================================================
// API ROUTES — Google Maps (Terminal Navigation)
// ============================================================

// GET /api/navigation/:airportTerminal — Navigation steps
app.get('/api/navigation/:airportTerminal', async (req, res) => {
    await simulateLatency(100, 300);
    const nav = terminalNavigation[req.params.airportTerminal];
    if (!nav) return res.status(404).json({ error: 'Terminal not found', source: 'google-maps-indoor' });
    res.json({
        source: 'google-maps-indoor',
        timestamp: new Date().toISOString(),
        ...nav
    });
});

// ============================================================
// API ROUTES — Destination Info
// ============================================================

// GET /api/destination/:airportCode — Destination details
app.get('/api/destination/:airportCode', async (req, res) => {
    await simulateLatency();
    const dest = destinations[req.params.airportCode.toUpperCase()];
    if (!dest) return res.status(404).json({ error: 'Destination not found' });
    res.json({
        source: 'journey-air-destination-api',
        timestamp: new Date().toISOString(),
        ...dest
    });
});

// ============================================================
// API ROUTES — Passengers
// ============================================================

// GET /api/passengers/:id — Passenger profile
app.get('/api/passengers/:id', async (req, res) => {
    await simulateLatency();
    const pax = passengers[req.params.id];
    if (!pax) return res.status(404).json({ error: 'Passenger not found' });
    res.json({
        source: 'journey-air-pss',
        timestamp: new Date().toISOString(),
        passenger: pax
    });
});

// ============================================================
// API ROUTES — Dashboard / Operations
// ============================================================

// GET /api/disruptions — All active disruptions
app.get('/api/disruptions', async (req, res) => {
    await simulateLatency();
    res.json({
        source: 'journey-air-ops',
        timestamp: new Date().toISOString(),
        activeCount: disruptions.length,
        totalPaxAffected: disruptions.reduce((sum, d) => sum + d.paxAffected, 0),
        avgRecoveryRate: Math.round(disruptions.reduce((sum, d) => sum + d.autoRecoveryRate, 0) / disruptions.length),
        disruptions
    });
});

// GET /api/stats — Dashboard KPIs
app.get('/api/stats', async (req, res) => {
    await simulateLatency();
    res.json({
        source: 'journey-air-analytics',
        timestamp: new Date().toISOString(),
        kpis: {
            activeDisruptions: disruptions.length,
            passengersPending: 47,
            autoRecoveryRate: '87%',
            escalationsOpen: 6,
            agentDeflectionRate: '73%',
            avgResolutionTime: '2.3 min',
            csat: 4.6,
            totalPaxServedToday: 1247
        }
    });
});

// ============================================================
// PARTNER AIRLINES DATA
// ============================================================
const partnerAirlines = [
    { code: 'UA', name: 'United Airlines', alliance: 'Star Alliance', tier: 1, color: '#0032A0', dailyFlights: '5,000+', integration: ['Codeshare', 'Bag Transfer', 'Lounge Access'], hub: 'SFO, ORD, EWR, IAD, IAH, DEN, LAX' },
    { code: 'AA', name: 'American Airlines', alliance: 'Oneworld', tier: 1, color: '#0078D2', dailyFlights: '6,700+', integration: ['Codeshare', 'Bag Transfer', 'Priority Rebooking'], hub: 'DFW, CLT, MIA, PHX, PHL, ORD, LAX' },
    { code: 'DL', name: 'Delta Air Lines', alliance: 'SkyTeam', tier: 1, color: '#003366', dailyFlights: '5,400+', integration: ['Codeshare', 'Bag Transfer', 'Sky Club'], hub: 'ATL, MSP, DTW, SLC, JFK, SEA, LAX' },
    { code: 'B6', name: 'JetBlue Airways', alliance: 'Independent', tier: 2, color: '#304CB2', dailyFlights: '1,000+', integration: ['Interline', 'Bag Transfer'], hub: 'JFK, BOS, FLL, MCO, SJU' },
    { code: 'WN', name: 'Southwest Airlines', alliance: 'Independent', tier: 2, color: '#FFBF27', dailyFlights: '4,000+', integration: ['Recovery Only', 'Free Bags'], hub: 'DAL, MDW, BWI, DEN, LAS, OAK, HOU' },
    { code: 'F9', name: 'Frontier Airlines', alliance: 'Independent', tier: 2, color: '#00853F', dailyFlights: '600+', integration: ['Recovery Only'], hub: 'DEN, LAS, MCO, ATL, PHL' },
    { code: 'BA', name: 'British Airways', alliance: 'Oneworld', tier: 1, color: '#BA0D2F', dailyFlights: '800+', integration: ['Codeshare', 'Bag Transfer', 'Lounge Access'], hub: 'LHR, LGW' },
    { code: 'LH', name: 'Lufthansa', alliance: 'Star Alliance', tier: 1, color: '#002D62', dailyFlights: '700+', integration: ['Codeshare', 'Bag Transfer'], hub: 'FRA, MUC' }
];

const baggageAddons = [
    { id: 'priority', name: 'Priority Handling', description: 'Your bag comes out first at the carousel', price: 14.99, currency: 'USD' },
    { id: 'insurance', name: 'Bag Insurance', description: 'Up to $3,000 coverage for loss or damage', price: 9.99, currency: 'USD' },
    { id: 'extra', name: 'Extra Bag', description: 'Add a second checked bag (up to 23kg)', price: 45.00, currency: 'USD' },
    { id: 'oversize', name: 'Oversized Bag', description: 'Sports equipment or oversized luggage', price: 75.00, currency: 'USD' }
];

// ============================================================
// API ROUTES — Partner Airlines
// ============================================================

app.get('/api/partners', async (req, res) => {
    await simulateLatency();
    const tier = req.query.tier ? parseInt(req.query.tier) : null;
    const filtered = tier ? partnerAirlines.filter(a => a.tier === tier) : partnerAirlines;
    res.json({
        source: 'journey-air-partnerships',
        timestamp: new Date().toISOString(),
        count: filtered.length,
        partners: filtered
    });
});

app.get('/api/partners/:code', async (req, res) => {
    await simulateLatency();
    const airline = partnerAirlines.find(a => a.code === req.params.code.toUpperCase());
    if (!airline) return res.status(404).json({ error: 'Partner airline not found' });
    res.json({ source: 'journey-air-partnerships', timestamp: new Date().toISOString(), partner: airline });
});

// ============================================================
// API ROUTES — Baggage Add-ons
// ============================================================

app.get('/api/addons/baggage', async (req, res) => {
    await simulateLatency();
    res.json({
        source: 'journey-air-ancillary',
        timestamp: new Date().toISOString(),
        addons: baggageAddons
    });
});

app.post('/api/addons/baggage/purchase', async (req, res) => {
    await simulateLatency(200, 500);
    const { addonId, passengerId } = req.body;
    const addon = baggageAddons.find(a => a.id === addonId);
    if (!addon) return res.status(400).json({ error: 'Invalid add-on' });
    res.json({
        source: 'journey-air-ancillary',
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        addon: addon.name,
        price: addon.price,
        confirmationCode: 'AON-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        message: `${addon.name} added successfully to your booking.`
    });
});

// ============================================================
// API ROUTES — Boarding Pass
// ============================================================

app.get('/api/boarding-pass/:passengerId/:flightNumber', async (req, res) => {
    await simulateLatency();
    const pax = passengers[req.params.passengerId];
    const flight = flights[req.params.flightNumber?.toUpperCase()];
    if (!pax || !flight) return res.status(404).json({ error: 'Booking not found' });
    res.json({
        source: 'journey-air-dcs',
        timestamp: new Date().toISOString(),
        checkedIn: true,
        boardingPass: {
            passenger: pax.name.toUpperCase(),
            flight: flight.flightNumber,
            date: '13 APR 2026',
            from: flight.origin,
            to: flight.destination,
            seat: '14A',
            boardingGroup: 2,
            boardingTime: '11:45 AM',
            gate: flight.origin.gate,
            class: 'Economy',
            bookingRef: pax.bookingRef,
            qrData: `JA|${pax.bookingRef}|${flight.flightNumber}|14A|${pax.name}|SFO|LHR|20260413`
        }
    });
});

// ============================================================
// API ROUTES — Chatbot
// ============================================================

app.post('/api/chat', async (req, res) => {
    await simulateLatency(200, 600);
    const { message, passengerId } = req.body;
    const lower = (message || '').toLowerCase();

    let intent = 'unknown';
    let response = 'I\'m not sure I understand. Try asking about your flight, baggage, connection, or rebooking options.';

    if (/flight|status|delay|ja204|depart/.test(lower)) {
        intent = 'flight_status';
        response = 'Your flight JA204 (SFO→LHR) is delayed by 1h 45m. New departure: 12:15 PM.';
    } else if (/bag|luggage|suitcase/.test(lower)) {
        intent = 'baggage';
        response = 'Your bag SW-82749102 is safely loaded on JA204. Estimated carousel: #7.';
    } else if (/connect|transfer|miss/.test(lower)) {
        intent = 'connection';
        response = 'Your connection JA512 is at risk. Estimated time: 38 min (minimum: 45 min).';
    } else if (/rebook|change|option|alter/.test(lower)) {
        intent = 'rebooking';
        response = '3 recovery options available. Recommended: JA712 via Chicago.';
    } else if (/partner|airline|united|american|delta/.test(lower)) {
        intent = 'partners';
        response = 'Journey Air partners with 8 carriers: UA, AA, DL, B6, WN, F9, BA, LH.';
    } else if (/boarding|check.?in|qr|scan/.test(lower)) {
        intent = 'boarding_pass';
        response = 'Your boarding pass is ready. Flight JA204, Seat 14A, Gate B14, Group 2.';
    } else if (/human|agent|person|speak|call/.test(lower)) {
        intent = 'human_agent';
        response = 'Connecting to a human agent. Estimated wait: 2 min (Gold priority).';
    } else if (/hi|hello|hey|help/.test(lower)) {
        intent = 'greeting';
        response = 'Hi! I can help with flights, baggage, connections, rebooking, partners, and more.';
    }

    res.json({
        source: 'journey-air-ai-agent',
        timestamp: new Date().toISOString(),
        intent,
        response,
        suggestedActions: intent === 'flight_status'
            ? ['View rebooking', 'Track baggage', 'See boarding pass']
            : ['Check flight', 'Track baggage', 'Talk to agent']
    });
});

// ============================================================
// API Documentation endpoint
// ============================================================
app.get('/api', (req, res) => {
    res.json({
        name: 'Journey Air API',
        version: '2.0.0',
        description: 'Passenger Certainty Platform — Mock API simulating airline integrations',
        endpoints: {
            flights: {
                'GET /api/flights': 'List all flights (Amadeus GDS)',
                'GET /api/flights/:flightNumber': 'Flight details',
                'GET /api/flights/:flightNumber/status': 'Real-time flight status'
            },
            recovery: {
                'GET /api/recovery/:passengerId': 'Get recovery options for disrupted passenger',
                'POST /api/recovery/:passengerId/confirm': 'Confirm rebooking { optionId: "REC-001" }'
            },
            baggage: {
                'GET /api/baggage/:tagId': 'Full baggage journey (SITA BagJourney)',
                'GET /api/baggage/:tagId/live': 'Live tracking data'
            },
            baggageAddons: {
                'GET /api/addons/baggage': 'List available baggage add-ons',
                'POST /api/addons/baggage/purchase': 'Purchase add-on { addonId, passengerId }'
            },
            partners: {
                'GET /api/partners': 'All partner airlines (optional ?tier=1)',
                'GET /api/partners/:code': 'Single partner details (UA, AA, DL, etc.)'
            },
            boardingPass: {
                'GET /api/boarding-pass/:passengerId/:flight': 'Get mobile boarding pass with QR data'
            },
            chatbot: {
                'POST /api/chat': 'AI chatbot { message, passengerId }'
            },
            navigation: {
                'GET /api/navigation/:airportTerminal': 'Terminal walking directions (Google Maps Indoor)'
            },
            destination: {
                'GET /api/destination/:code': 'Destination info (weather, currency, tips)'
            },
            passengers: {
                'GET /api/passengers/:id': 'Passenger profile'
            },
            dashboard: {
                'GET /api/disruptions': 'All active disruptions',
                'GET /api/stats': 'Dashboard KPIs'
            }
        },
        sampleIds: {
            passenger: 'PAX-001',
            flight: 'JA204',
            baggage: 'SW-82749102',
            terminal: 'LHR-T5',
            destination: 'LHR',
            partner: 'UA'
        }
    });
});

// ============================================================
// Start server
// ============================================================
app.listen(PORT, () => {
    console.log(`
  ✈️  Journey Air API Server
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌐  App:     http://localhost:${PORT}
  📡  API:     http://localhost:${PORT}/api
  📊  Flights: http://localhost:${PORT}/api/flights
  🧳  Baggage: http://localhost:${PORT}/api/baggage/SW-82749102
  🗺️   Nav:     http://localhost:${PORT}/api/navigation/LHR-T5
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
