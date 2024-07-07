import { json } from '@sveltejs/kit';
import { makeClient, existsUser } from '$lib/database'

export async function GET({ url }) {
    let userId = url.searchParams.get('userId')

    const client = makeClient()

    if (!userId) {
        return json({
            success: false,
            message: 'ユーザーIDが不明です。'
        })
    }
    if (!await existsUser(client, userId)) {
        return json({
            success: false,
            message: 'そのユーザーは存在しません。'
        })
    }

    return json({
        success: true,
        message: '取得に成功しました。',
        profile: ((await client.select('username, display_name, description', 'profiles', `user_id = '${userId}'`)).map(response => { return {
            'username': response.username,
            'displayName': response.display_name,
            'userId': response.userId
        } })[0])
    })
}