<script lang='ts'>
    export let room: {
        'name': string,
        'id': string
    }
</script>

<div class='border-[2px] rounded-[10px] px-[20px] py-[10px]'>
    <a href='/talk?room={room.id}'>
        <h1 class='text-2xl font-bold'>{room.name}</h1>
        <div class='flex'>
            
        </div>
    </a>
</div>