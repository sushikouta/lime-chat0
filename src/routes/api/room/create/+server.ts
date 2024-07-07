import { json } from '@sveltejs/kit'
import { makeClient, checkToken, existsRoom } from '$lib/database'

const icons = [
    '😀', '😁', '😅', '🤣', '😍', '🥰', '😋', '😎', '🤩', '🥳', 
    '🥺', '😭', '😡', '🥶', '🤔', '👻', '🕶️', '🐶', '🐱', '🐭', 
    '🐰', '🦊', '🐻', '🦁', '🐷', '🐵', '🐔', '🐣', '🐙', '🦑', 
    '🐟', '🐬', '🌲', '🍀', '🍄', '🌝', '⭐️', '✨', '⚡️', '💥', 
    '🔥', '🌈', '☀️', '☁️', '❄️', '💧', '💦', '🫧', '🍏', '🍎', 
    '🍐', '🍊', '🍋', '🍋‍🟩', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', 
    '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', 
    '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞', 
    '🥖', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', 
    '🍖', '🦴', '🌭', '🍔', '🍕', '🌮', '🍜', '🍛', '🍣', '🥟', 
    '🦪', '🍤', '🍙', '🍥', '🍢', '🍡', '🍰', '🍭', '🍬', '🍫', 
    '🍪', '☕️', '🍻', '🍴', '⚽️', '🏀', '🏈', '⚾️', '🏐', '🏉', 
    '🎱', '🏓', '🥁', '🎲', '🧩', '🛞', '🚨', '🗿', '⛱️', '🏩', 
    '⛩️'
]

export async function GET({ url }) {
    let userId = url.searchParams.get('userId')
    let loginToken = url.searchParams.get('loginToken')
    let name = url.searchParams.get('roomName')

    if (!userId || !loginToken) {
        return json({
            success: false,
            message: 'ログインに失敗しました。'
        })
    }
    if (!name) {
        return json({
            success: false,
            message: '部屋の名前が未設定です。'
        })
    }
    if (name.length > 16) {
        return json({
            success: false,
            message: '部屋の名前が長すぎます。'
        })
    }

    let icon = icons[Math.floor(Math.random() * icons.length)]

    const client = makeClient()

    if (!await checkToken(client, userId, loginToken)) {
        return json({
            success: false,
            message: 'ログインに失敗しました。'
        })
    }

    let roomId = crypto.randomUUID()

    await client.insert('rooms', `'${roomId}', '["${userId}"]', '${userId}', DEFAULT, '${name}', '${icon}'`)

    return json({
        success: true,
        message: '部屋が作成されました。',
        roomId: roomId
    })
}