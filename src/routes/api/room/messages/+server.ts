import { json } from '@sveltejs/kit'
import { makeClient, checkToken, existsRoom } from '$lib/database'

export async function GET({ url }) {
    let userId = url.searchParams.get('userId')
    let loginToken = url.searchParams.get('loginToken')
    let roomId = url.searchParams.get('roomId')
    let limit = Number(url.searchParams.get('limit') || '30')

    if (!userId || !loginToken) {
        return json({
            success: false,
            message: 'ログインに失敗しました。'
        })
    }
    if (!roomId) {
        return json({
            success: false,
            message: '部屋が見つかりません。'
        })
    }

    const client = makeClient()

    if (!await checkToken(client, userId, loginToken)) {
        return json({
            success: false,
            message: 'ログインに失敗しました。'
        })
    }
    if (!await existsRoom(client, roomId)) {
        return json({
            success: false,
            message: '部屋が見つかりません。'
        })
    }
    if (!(await client.select('members', 'rooms', `id = '${roomId}'`))[0].members.includes(userId)) {
        return json({
            success: false,
            message: '部屋が見つかりません。'
        })
    }

    return json({
        success: true,
        message: '取得が完了しました。',
        messages: (await client.select('index, sent_time, content_text, recipient_id, is_edited, display_name', 'messages INNER JOIN profiles ON messages.recipient_id = profiles.user_id', `room_id = '${roomId}'`, `ORDER BY index DESC LIMIT ${limit}`)).map(message => {
            return {
                'index': message.index,
                'sentTime': message.sent_time,
                'contentText': message.content_text,
                'recipientId': message.recipient_id,
                'isEdited': message.authorid,
                'displayName': message.display_name
            }
        })
    })
}