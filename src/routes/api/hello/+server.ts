export async function GET({ url }) {
    let name = url.searchParams.get('name') || 'guest'

    return new Response(`hello! ${name}!`)
}
