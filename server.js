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
	res.send(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>Fubo TV Prototypes</title>
			<style>
				body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #000; color: #fff; }
				.container { max-width: 800px; margin: 0 auto; }
				h1 { color: #00d084; margin-bottom: 30px; }
				.prototype-link { display: block; margin: 20px 0; padding: 20px; background: #1a1a1a; border-radius: 8px; text-decoration: none; color: #fff; transition: background 0.3s; }
				.prototype-link:hover { background: #2a2a2a; }
				.prototype-link h3 { margin: 0 0 10px 0; color: #00d084; }
				.prototype-link p { margin: 0; opacity: 0.8; }
			</style>
		</head>
		<body>
			<div class="container">
				<h1>🎬 Fubo TV Prototypes</h1>
				<a href="/toast-user-dismiss" class="prototype-link">
					<h3>Toast: User Dismiss</h3>
					<p>Interactive toast notification that requires user input to dismiss</p>
				</a>
				<a href="/toast-auto-dismiss" class="prototype-link">
					<h3>Toast: Auto-dismiss</h3>
					<p>Toast notification that automatically dismisses after a set time</p>
				</a>
				<a href="/ribbon-user-dismiss" class="prototype-link">
					<h3>Ribbon: User Dismiss</h3>
					<p>Ribbon notification requiring user interaction to dismiss</p>
				</a>
				<a href="/ribbon-auto-dismiss" class="prototype-link">
					<h3>Ribbon: Auto-dismiss</h3>
					<p>Ribbon notification that automatically dismisses</p>
				</a>
			</div>
		</body>
		</html>
	`);
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

app.get('/test-entertainment', (req, res) => {
    io.emit('show-promo', { promoType: 'primetime_promo' });
    res.json({ message: 'Entertainment promo triggered' });
});

// Alternative naming for clarity
app.get('/test-primetime', (req, res) => {
    io.emit('show-promo', { promoType: 'primetime_promo' });
    res.json({ message: 'Primetime promo triggered' });
});

// Reset to game playing state
app.get('/reset-game', (req, res) => {
    io.emit('reset-to-game');
    res.json({ message: 'Reset to game playing' });
});

// Get current promo delay setting
app.get('/promo-delay', (req, res) => {
    res.json({ 
        currentDelay: TRIGGER_DELAY_SECONDS,
        message: `Promo appears after ${TRIGGER_DELAY_SECONDS} seconds` 
    });
});

// Railway deployment routes - direct access to specific Figma states
app.get('/toast-user-dismiss', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'toast-user-dismiss.html'));
});

app.get('/toast-auto-dismiss', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'toast-auto-dismiss.html'));
});

app.get('/ribbon-user-dismiss', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ribbon-user-dismiss.html'));
});

app.get('/ribbon-auto-dismiss', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ribbon-auto-dismiss.html'));
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
	// Promo is now handled client-side with countdown
	// No need for server-side timing
});

server.listen(PORT, '0.0.0.0', () => console.log(`Server is listening on port ${PORT}`));
