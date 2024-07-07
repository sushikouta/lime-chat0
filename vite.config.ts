import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { Server } from 'socket.io'
import axios from 'axios'
import type { Message } from '$lib/database'

function websocketPlugin(mode: string) {
	return {
		name: 'websocket',
		configureServer(server: any) {
			let io = new Server(server.httpServer)

			const messageLimit = 30

			io.on('connection', socket => {
				let userId: string
				let roomId: string

				socket.on('join', async message => {
					let data: {
						'userId': string,
						'loginToken': string,
						'roomId': string,
						'limit': number
					} = JSON.parse(message)

					let response: {
						'success': boolean,
						'message': string,
						'messages': Message[]
					} = (await axios.get(`http://localhost:5173/api/room/messages?userId=${data.userId}&loginToken=${data.loginToken}&roomId=${data.roomId}&limit=${data.limit || messageLimit}`)).data

					if (response.success) {
						userId = data.userId
						roomId = data.roomId

						socket.join(roomId)

						socket.emit('init', JSON.stringify({
							success: true,
							messages: response.messages
						}))
					} else {
						socket.emit('init', JSON.stringify({
							success: false,
							message: response.message
						}))
						socket.disconnect()
					}
				})

				socket.on('send', async message => {
					let data: {
						'userId': string,
						'loginToken': string
						'contentText': string
					} = JSON.parse(message)

					let response: {
						'success': boolean,
						'message': string,
						'sendMessage': Message
					} = (await axios.get(`http://localhost:5173/api/room/send?userId=${data.userId}&loginToken=${data.loginToken}&roomId=${roomId}&contentText=${data.contentText}`)).data

					if (response.success) {
						io.in(roomId).emit('message', JSON.stringify(response.sendMessage))
					}
				})
			})
		}
	}
}

export default defineConfig(({ mode }) => {
	return {
		plugins: [
			sveltekit(),
			websocketPlugin(mode)
		]
	}
});
