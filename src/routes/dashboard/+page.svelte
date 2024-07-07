<script lang="ts">
    import Room from '$lib/Room.svelte'

    import { onMount } from 'svelte'
    import axios from 'axios'
    import cookies from 'js-cookie'

    let loaded = false

    async function main() {
        let userId     = cookies.get('userId')
        let loginToken = cookies.get('loginToken')

        if (userId == undefined || loginToken == undefined) {
            window.location.href = '/account'
        } else {
            try {
                let response: {
                    'success': boolean,
                    'message': string
                } = (await axios.get(`${import.meta.env.VITE_HOST}:${import.meta.env.VITE_PORT}/api/account/logged?userId=${userId}&loginToken=${loginToken}`)).data

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
    }

    onMount(main)
</script>

{#if loaded}
    <div class="w-[100%] max-w-[max(800px,60%)] mx-[auto] p-[20px]">
        <Room room={{'name': 'オープンチャット！', 'id': '729c41c4-e9e8-4144-af10-ceb06e8ae0be'}}/>
    </div>
{:else}
    <div class="mt-[50vh] translate-y-[-50%] text-center text-xl">Now Loading...</div>
{/if}