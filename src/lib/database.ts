import pg from 'pg'

export class Client {
    client: pg.Client

    constructor(client: pg.Client) {
        this.client = client
    }

    async insert(into: string, values: string) {
        await this.client.query(`INSERT INTO ${into} VALUES (${values})`)
    }
    async select(select: string, from: string | null = null, where: string | null = null, option: string | null = null): Promise<any[]> {
        return (await this.client.query(this.query(select, from, where, option))).rows
    }
    async exists(select: string, from: string | null = null, where: string | null = null, option: string | null = null): Promise<boolean> {
        return (await this.client.query(`SELECT EXISTS (${this.query(select, from, where, option)})`)).rows[0].exists
    }
    async delete(from: string, where: string) {
        await this.client.query(`DELETE FROM ${from} WHERE ${where}`)
    }

    query(select: string, from: string | null = null, where: string | null = null, option: string | null = null) {
        return `SELECT ${select}` + (from != null ? ` FROM ${from}` : '') + (where != null ? ` WHERE ${where}` : '') + (option != null ? ` ${option}` : '')
    }
}

export function makeClient(): Client {
    var client = new pg.Client({
        user: import.meta.env.VITE_PGUSER,
        host: import.meta.env.VITE_PGHOST,
        database: import.meta.env.VITE_PGDATABASE,
        password: import.meta.env.VITE_PGPASSWORD,
        port: Number(import.meta.env.VITE_PGPORT)
    })
    
    client.connect()

    return new Client(client)
}

export async function makeToken(client: Client, userId: string): Promise<string> {
    let loginToken = crypto.randomUUID()

    await client.insert('tokens', `'${loginToken}', '${userId}', DEFAULT`)

    return loginToken
}

export async function existsUser(client: Client, userId: string): Promise<boolean> {
    return await client.exists('*', 'accounts', `id = '${userId}'`)
}

const tokenVaildTime = 1000 * 60 * 60 * 24 * 7
export async function checkToken(client: Client, userId: string, loginToken: string): Promise<boolean> {
    // await client.delete('tokens', `createdtime < ${new Date().getTime() - tokenVaildTime}`)

    if (await existsUser(client, userId)) {
        return await client.exists('*', 'tokens', `login_token = '${loginToken}'`)
    }

    return false
}

export async function existsRoom(client: Client, roomId: string): Promise<boolean> {
    return await client.exists('*', 'rooms', `id = '${roomId}'`)
}

export type Account = {
    'userId': string
}

export type Message = {
    'index': number,
    'sentTime': string,
    'contentText': string,
    'recipientId': string,
    'isEdited': boolean,
    'displayName': string
}