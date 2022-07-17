import { Server } from "socket.io"
import attachrealtime from './realtime.js'

export default {
    io: {
        name: 'realtime',
        configureServer(server) {
            const io = new Server(server.httpServer)
            attachrealtime(io)
        }
    }
}