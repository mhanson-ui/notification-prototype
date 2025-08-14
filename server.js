const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5000;

// ===================================================================
// ## MODERATOR CONFIGURATION ##
// Change this value to set how many seconds to wait before the promo appears.
const TRIGGER_DELAY_SECONDS = process.env.TRIGGER_DELAY_SECONDS ? Number(process.env.TRIGGER_DELAY_SECONDS) : 10;
// ===================================================================

app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1h',
    etag: true,
    lastModified: true
}));

// Serve TV screen by default at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tv.html'));
});

// Simple health check for connectivity tests
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Test routes to trigger specific promo types immediately
app.get('/test-sports', (req, res) => {
    io.emit('show-promo', { promoType: 'sports_promo' });
    res.json({ message: 'Sports promo triggered' });
});

app.get('/test-primetime', (req, res) => {
    io.emit('show-promo', { promoType: 'primetime_promo' });
    res.json({ message: 'Primetime promo triggered' });
});

function getContextualPromoType() {
	const location = 'United States';
	// Current context: Wednesday, August 13, 2025 at 4:52 PM EDT
	const now = new Date('2025-08-13T16:52:56-04:00');
	const currentHour = now.getHours(); // This will be 16

	// Logic: If it's 4 PM (hour 16) or later, it's primetime context.
	if (currentHour >= 16) {
		console.log('Context: Approaching evening. Choosing Primetime Promo.');
		return 'primetime_promo';
	} else {
		console.log('Context: Daytime. Choosing Sports Promo.');
		return 'sports_promo';
	}
}

io.on('connection', (socket) => {
	console.log('A user connected.');
	setTimeout(() => {
		const promoType = getContextualPromoType();
		io.emit('show-promo', { promoType: promoType });
	}, TRIGGER_DELAY_SECONDS * 1000);

	socket.on('remote-input', (data) => {
		io.emit('tv-command', data);
	});
});

server.listen(PORT, '0.0.0.0', () => console.log(`Server is listening on port ${PORT}`));
