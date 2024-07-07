<script lang="ts">
    import MessageNode from '$lib/Message.svelte'
    import { onMount } from 'svelte'
    import axios from 'axios'
    import cookies from 'js-cookie'
    import { io, Socket } from 'socket.io-client'
    import type { Message } from '$lib/database'

    let userId: string | undefined
    let loginToken: string | undefined

    let loaded = false

    let errorMessage = ''
    let isError = false

    function throwError(message: string) {
        errorMessage = message
        isError = true
    }

    let socket: Socket

    let websocketLoading = false

    let messages: Message[] = []

    let messageText = ""

    let sending = false

    async function main() {
        userId = cookies.get('userId')
        loginToken = cookies.get('loginToken')

        if (userId == undefined || loginToken == undefined) {
            window.location.href = '/account'
        } else {
            try {
                let response: {
                    'success': boolean,
                    'message': string
                } = (await axios.get(`http://localhost:${import.meta.env.VITE_PORT}/api/account/logged?userId=${userId}&loginToken=${loginToken}`)).data

                if (!response.success) {
                    cookies.remove('userId')
                    cookies.remove('loginToken')

                    window.location.href = '/account'
                }
            } catch (e) {
                cookies.remove('userId')
                cookies.remove('loginToken')

                window.location.href = '/account'
            }
        } 

        loaded = true

        const url = new URL(decodeURIComponent(document.location.href))

        let roomId = url.searchParams.get('room')

        if (!roomId) {
            throwError('部屋が見つかりません。')
            return
        }

        websocketLoading = true

        socket = io('http://localhost:5173/')

        socket.on('connect', () => {
            socket.emit('join', JSON.stringify({
                'userId': userId,
                'loginToken': loginToken,
                'roomId': roomId
            }))
        })

        socket.on('init', message => {
            let data: {
                'success': boolean,
                'message': string,
                'messages': Message[]
            } = JSON.parse(message)

            if (!data.success) {
                throwError(data.message)
                socket.close()
            } else {
                messages = [...data.messages.reverse()]
                websocketLoading = false
            }
        })

        socket.on('message', message => {
            let data: Message = JSON.parse(message)

            messages = [...messages, data]

            if (userId == data.recipientId) {
                if (sending) {
                    messageText = ""

                    sending = false
                }
            }
        })
    }

    onMount(main)

    async function send() {
        sending = true

        socket.emit('send', JSON.stringify({
            userId: userId,
            loginToken: loginToken,
            contentText: messageText
        }))
    }
</script>

{#if loaded}
    {#if isError}
        <div class="flex has-text-danger mt-[50vh] translate-y-[-50%] mx-[auto] items-center justify-center">
            <div class="icon mr-[10px] my-[auto]">
                <i class="fa-solid fa-circle-exclamation"></i>
            </div>
            <p class="my-[auto]">{errorMessage}</p>
        </div>
    {:else}
        <div class="h-[100%] p-[20px]">
            <div class="overflow-auto h-[calc(100%-40px)]">
                {#if websocketLoading}
                    <div class="mt-[50vh] translate-y-[-50%] text-center text-xl">接続中...</div>
                {:else}
                    {#if messages.length}
                        {#each messages as message}
                            <div class="mb-[10px]">
                                <MessageNode content={message} />
                            </div>
                        {/each}
                    {:else}
                        <p>まだ誰も発言していません。</p>
                    {/if}
                {/if}
            </div>
            <div class="flex mt-[10px]">
                <input type="text" class="input is-small mr-[10px] font-bold" bind:value={messageText} disabled={websocketLoading || sending} />
                <button class="button is-link is-small" on:click={send} disabled={websocketLoading || sending}>送信</button>
            </div>
        </div>
    {/if}
{:else}
    <div class="mt-[50vh] translate-y-[-50%] text-center text-xl">Now Loading...</div>
{/if}