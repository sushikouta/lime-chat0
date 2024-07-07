<script lang="ts">
    import { fade } from 'svelte/transition'

    import { onMount } from 'svelte'
    import axios from 'axios'
    import cookies from 'js-cookie'

    let loaded = false
    let logged = false
    
    let profileLoaded = false

    let profile: {
        'username': string,
        'displayName': string,
        'description': string
    }

    async function main() {
        let userId     = cookies.get('userId')
        let loginToken = cookies.get('loginToken')

        if (userId != undefined && loginToken != undefined) {
            try {
                let response: {
                    'success': boolean,
                    'message': string
                } = (await axios.get(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/api/account/logged?userId=${userId}&loginToken=${loginToken}`)).data

                if (response.success) {
                logged = true
            } else {
                cookies.remove('userId')
                cookies.remove('loginToken')
            }
            } catch (e) {
                cookies.remove('userId')
                cookies.remove('loginToken')
            }
        }
        
        loaded = true

        if (logged) {
            let response: {
                'success': boolean,
                'message': string,
                'profile': {
                    'username': string,
                    'displayName': string,
                    'description': string
                }
            } = (await axios.get(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/api/account/profile?userId=${userId}`)).data

            if (response.success) {
                profile = response.profile

                profileLoaded = true
            }
        }
    }

    onMount(main)

    let username = ''
    let password = ''

    let isLoading = false

    let errorMessage = ''
    let isError = false
    let lastError: NodeJS.Timeout | null = null

    async function throwError(message: string) {
        errorMessage = message
        isError = true

        if (lastError != null) {
            clearTimeout(lastError)
        }

        lastError = setTimeout(() => {
            isError = false
        }, 5 * 1000)
    }

    async function login() {
        if (!username) {
            throwError('ユーザーネームが空です。')
            return
        }
        if (!password) {
            throwError('パスワードが空です。')
            return
        }

        isLoading = true

        let response: {
            'success': boolean,
            'message': string,
            'userId': string
            'loginToken': string,
        } = (await axios.get(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/api/account/login?username=${username}&password=${password}`)).data

        if (response.success) {
            cookies.set('userId',     response.userId,     { expires: 7 })
            cookies.set('loginToken', response.loginToken, { expires: 7 })

            window.location.href = '/dashboard';
        } else {
            throwError(response.message)
        }

        isLoading = false
    }

    async function logout() {
        isLoading = true

        cookies.remove('userId')

        let loginToken = cookies.get('loginToken')

        await axios.get(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/api/account/logout?loginToken=${loginToken}`)

        cookies.remove('loginToken')

        window.location.reload()
    }
</script>

{#if loaded}
    <div class="w-[100%] max-w-[max(500px,60%)] mx-[auto] mt-[50%] translate-y-[-50%]">
        {#if logged}
            <h1 class="font-bold text-3xl mb-[20px]">プロフィール</h1>
            <div class="p-[20px] border-[2px] rounded-[10px]">
                {#if profileLoaded}
                    <div class="inline-flex mb-[15px]">
                        <p class="font-bold text-2xl mr-[10px]">{profile.displayName}</p>
                        <p class="my-[auto] max-w-none">{profile.username}</p>
                    </div>
                    <p class="font-bold text-xl mb-[10px] underline">自己紹介</p>
                    {#if profile.description}
                        <p>{profile.description}</p>
                    {:else}
                        <p class="text-gray-500">未設定</p>
                    {/if}
                {:else}
                    <div class="flex mb-[15px]">
                        <div class="skeleton-block w-[200px] h-[32px] mr-[10px]"></div>
                        <div class="skeleton-block w-[75px] h-[24px] my-[4px]"></div>
                    </div>
                    <div class="mb-[15px]">
                        <div class="skeleton-block w-[80px] h-[28px]"></div>
                    </div>
                    <div class="skeleton-lines">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                {/if}
                <!--
                <p class="font-bold text-xl mb-[10px] underline">称号</p>
                <p>売人　happa happy</p>
                -->
            </div>
            <div class="flex">
                <button class="button is-danger is-small mt-[10px] ml-[auto]" class:is-loading={isLoading} on:click={logout}>ログアウト</button>
            </div>
        {:else}
            <h1 class="font-bold text-3xl mb-[20px]">ログイン</h1>
            <form method="GET">
                <div class="flex mb-[15px]">
                    <div class="min-w-[160px]">
                        <label class="text-xl font-bold" for="username">ユーザーネーム</label>
                    </div>
                    <input type="text" class="input is-small w-[100%] ml-[auto] font-bold" id="username" bind:value={username} />
                </div>
                <div class="flex mb-[20px]">
                    <div class="min-w-[160px]">
                        <label class="text-xl font-bold" for="password">パスワード</label>
                    </div>
                    <input type="password" class="input is-small w-[100%] ml-[auto] font-bold" id="password" bind:value={password} />
                </div>
                <div class="flex">
                    {#if isError}
                        <div class="flex has-text-danger" out:fade={{ duration: 300 }}>
                            <div class="icon mr-[10px] my-[auto]">
                                <i class="fa-solid fa-circle-exclamation"></i>
                            </div>
                            <p class="my-[auto]">{errorMessage}</p>
                        </div>
                    {/if}
                    <button type="submit" class="button is-link is-small ml-[auto]" class:is-loading={isLoading} on:click={login}>ログイン</button>
                </div>
            </form>
        {/if}
    </div>
{:else}
    <div class="mt-[50vh] translate-y-[-50%] text-center text-xl">Now Loading...</div>
{/if}

<style lang="scss">
    .skeleton-block {
        min-height: 0;
        margin-bottom: 0;
    }
    .skeleton-block:not(:last-child) {
        margin-bottom: 0;
    }
</style>