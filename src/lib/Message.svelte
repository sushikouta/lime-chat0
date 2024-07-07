<script lang='ts'>
    import type { Message } from '$lib/database'
    export let content: Message

console.log(content.sentTime)

    let date = new Date(content.sentTime)
</script>

<div class='flex text-gray-500 font-semibold'>
    <span class='mr-[10px]'>{content.index}:</span>
    <p class='mr-[10px]'>{date.getFullYear()}/{('0' + date.getMonth()).slice(0, 2)}/{('0' + date.getDay()).slice(0, 2)} {('0' + date.getHours()).slice(0, 2)}:{('0' + date.getMinutes()).slice(0, 2)}:{('0' + date.getSeconds()).slice(0, 2)}</p>
    <p>{content.displayName}</p>
</div>
<h2 class='text-2xl'>{content.contentText}</h2>