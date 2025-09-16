# WhatsApp Gateway API Documentation

## Overview
WhatsApp Gateway telah diperbaiki dan ditingkatkan untuk menyediakan fitur lengkap mengambil dan mengirim data WhatsApp melalui WebSocket.

## WebSocket Connection
- **Endpoint**: `ws://localhost:3000/ws`
- **Transport**: WebSocket, Polling
- **CORS**: Enabled for all origins

## Features

### 1. Session Management
- Membuat session WhatsApp baru
- Menghentikan session
- Memuat session dari storage
- Mendapatkan status session
- Mendapatkan daftar session aktif

### 2. Messaging
- Mengirim pesan teks
- Mengirim gambar
- Mengirim dokumen
- Mengirim video
- Mengirim audio/voice note
- Menerima pesan secara real-time

### 3. Contact & Profile
- Mengecek nomor WhatsApp aktif
- Mendapatkan info profil
- Mengirim typing indicator

## API Events

### Client to Server Events

#### `start_session`
Memulai session WhatsApp baru
```javascript
socket.emit('start_session', { sessionId: 'my-session' });
```

#### `stop_session`
Menghentikan session WhatsApp
```javascript
socket.emit('stop_session', { sessionId: 'my-session' });
```

#### `send_whatsapp_message`
Mengirim pesan WhatsApp
```javascript
socket.emit('send_whatsapp_message', {
  sessionId: 'my-session',
  to: '6282284316465',        // Phone number with country code
  message: 'Hello World!',
  type: 'text',               // 'text', 'image', 'document', 'video', 'audio'
  media: 'path/to/file.jpg'   // Optional: for media messages
});
```

#### `check_phone_number`
Mengecek apakah nomor WhatsApp aktif
```javascript
socket.emit('check_phone_number', {
  sessionId: 'my-session',
  phoneNumber: '6282284316465'
});
```

#### `get_profile_info`
Mendapatkan informasi profil
```javascript
socket.emit('get_profile_info', {
  sessionId: 'my-session',
  phoneNumber: '6282284316465'
});
```

#### `send_typing`
Mengirim indikator typing
```javascript
socket.emit('send_typing', {
  sessionId: 'my-session',
  to: '6282284316465',
  isTyping: true
});
```

#### `read_message`
Menandai pesan sebagai dibaca
```javascript
socket.emit('read_message', {
  sessionId: 'my-session',
  messageKey: messageKeyObject
});
```

#### `get_session_status`
Mendapatkan status session
```javascript
socket.emit('get_session_status', { sessionId: 'my-session' });
```

#### `get_active_sessions`
Mendapatkan daftar session aktif
```javascript
socket.emit('get_active_sessions');
```

#### `load_sessions_from_storage`
Memuat session dari storage
```javascript
socket.emit('load_sessions_from_storage');
```

#### `get_available_sessions`
Mendapatkan daftar session yang tersedia
```javascript
socket.emit('get_available_sessions');
```

### Server to Client Events

#### `qr_code`
QR Code untuk koneksi WhatsApp
```javascript
socket.on('qr_code', (data) => {
  console.log('QR Code:', data.qrCode);
  console.log('Session ID:', data.sessionId);
});
```

#### `session_connected`
Session berhasil terhubung
```javascript
socket.on('session_connected', (data) => {
  console.log('Session connected:', data.sessionId);
});
```

#### `session_disconnected`
Session terputus
```javascript
socket.on('session_disconnected', (data) => {
  console.log('Session disconnected:', data.sessionId);
});
```

#### `message_received`
Pesan diterima
```javascript
socket.on('message_received', (data) => {
  console.log('Message from:', data.message.from);
  console.log('Text:', data.message.text);
  console.log('Type:', data.message.type);
  console.log('Is Group:', data.message.isGroup);
  console.log('Timestamp:', data.message.timestamp);
});
```

#### `message_sent`
Pesan berhasil dikirim
```javascript
socket.on('message_sent', (data) => {
  console.log('Message sent to:', data.to);
  console.log('Message:', data.message);
});
```

#### `phone_check_result`
Hasil pengecekan nomor
```javascript
socket.on('phone_check_result', (data) => {
  console.log('Phone exists:', data.exists);
  console.log('Phone number:', data.phoneNumber);
});
```

#### `profile_info`
Informasi profil
```javascript
socket.on('profile_info', (data) => {
  console.log('Profile:', data.profileInfo);
});
```

#### `active_sessions`
Daftar session aktif
```javascript
socket.on('active_sessions', (sessions) => {
  sessions.forEach(session => {
    console.log('Session:', session.sessionId, 'Connected:', session.isConnected);
  });
});
```

#### `session_status`
Status session
```javascript
socket.on('session_status', (data) => {
  console.log('Session:', data.sessionId, 'Status:', data.status);
});
```

### Error Events

#### `session_error`
Error pada session
```javascript
socket.on('session_error', (data) => {
  console.error('Session error:', data.message);
});
```

#### `send_error`
Error saat mengirim pesan
```javascript
socket.on('send_error', (data) => {
  console.error('Send error:', data.message);
});
```

#### `phone_check_error`
Error saat mengecek nomor
```javascript
socket.on('phone_check_error', (data) => {
  console.error('Phone check error:', data.message);
});
```

## Testing
Gunakan file `whatsapp-test.html` untuk testing semua fitur:

1. Buka browser dan akses file tersebut
2. Pastikan server berjalan di `localhost:3000`
3. Test berbagai fitur melalui interface web

## Message Types
- **text**: Pesan teks biasa
- **image**: Gambar (JPG, PNG, dll)
- **document**: Dokumen (PDF, DOC, dll)
- **video**: Video (MP4, dll)
- **audio**: Voice note/audio

## Phone Number Format
Gunakan format internasional tanpa tanda '+':
- Indonesia: `628123456789`
- USA: `1234567890`

## Session Management Best Practices

1. **Unique Session IDs**: Gunakan ID unik untuk setiap session
2. **Storage**: Session akan disimpan otomatis dan dapat di-load ulang
3. **Connection Monitoring**: Monitor event connection/disconnection
4. **Error Handling**: Selalu handle error events

## Example Usage

### Mengirim Pesan Sederhana
```javascript
// 1. Connect
const socket = io('ws://localhost:3000', { path: '/ws' });

// 2. Start session
socket.emit('start_session', { sessionId: 'bot-session' });

// 3. Listen for QR code
socket.on('qr_code', (data) => {
  console.log('Scan this QR code:', data.qrCode);
});

// 4. Listen for connection
socket.on('session_connected', () => {
  // 5. Send message
  socket.emit('send_whatsapp_message', {
    sessionId: 'bot-session',
    to: '6282284316465',
    message: 'Hello from bot!',
    type: 'text'
  });
});

// 6. Listen for incoming messages
socket.on('message_received', (data) => {
  console.log('Received:', data.message.text);
});
```

## Troubleshooting

### Session tidak connect
- Pastikan QR code di-scan dengan benar
- Cek apakah WhatsApp Web aktif di device lain
- Restart session jika diperlukan

### Error saat mengirim pesan
- Pastikan session dalam status connected
- Cek format nomor telepon
- Pastikan nomor tujuan memiliki WhatsApp

### Media tidak terkirim
- Pastikan path file benar
- File harus accessible oleh server
- Cek ukuran file (ada limit WhatsApp)
